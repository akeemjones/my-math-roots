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
          p: 'What is the name of this shape? 🔺',
          v: null,
          s: 'Count the sides: 1, 2, 3 — three sides means triangle!',
          a: 'Triangle ✅'
        },
        {
          c: '#1976D2',
          tag: 'Round Shape',
          p: 'Which shape is perfectly round with no corners? 🔵',
          v: null,
          s: 'A circle has no sides and no corners — it is perfectly round.',
          a: 'Circle ✅'
        },
        {
          c: '#0D47A1',
          tag: 'Four Sides',
          p: 'This shape has 4 equal sides and 4 corners: ⬛ What is it?',
          v: null,
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
          t: 'What shape has NO corners and NO sides?',
          v: null,
          o: [{val:'circle'},{val:'triangle',tag:'err_random'},{val:'square',tag:'err_random'},{val:'rectangle',tag:'err_random'}],
          a:0, e:'Circle! It is perfectly round — no sides, no corners.', d:'e', s:null, h:'Think about the round shape'
        },
        {
          t: 'What shape has 3 sides?',
          v: null,
          o: [{val:'triangle'},{val:'circle',tag:'err_random'},{val:'square',tag:'err_random'},{val:'rectangle',tag:'err_random'}],
          a:0, e:'Triangle! It always has 3 sides.', d:'e', s:null, h:'Three sides — think of the shape 🔺'
        },
        {
          t: 'What shape has 4 equal sides and 4 corners?',
          v: null,
          o: [{val:'triangle',tag:'err_random'},{val:'circle',tag:'err_random'},{val:'square'},{val:'rectangle',tag:'err_random'}],
          a:2, e:'Square! All 4 sides are the same length.', d:'e', s:null, h:'4 corners and every side is the same length'
        },
        {
          t: 'What is the name of this shape? 🔺',
          v: null,
          o: [{val:'triangle'},{val:'circle',tag:'err_random'},{val:'square',tag:'err_random'},{val:'rectangle',tag:'err_random'}],
          a:0, e:'Triangle — 3 sides and 3 corners!', d:'e', s:null, h:'Count the corners: 1, 2, 3'
        },
        {
          t: 'What is the name of this shape? 🔵',
          v: null,
          o: [{val:'circle'},{val:'triangle',tag:'err_random'},{val:'square',tag:'err_random'},{val:'rectangle',tag:'err_random'}],
          a:0, e:'Circle — round with no corners!', d:'e', s:null, h:'Perfectly round with no pointy corners at all'
        },
        {
          t: 'What is the name of this shape? ⬛',
          v: null,
          o: [{val:'circle',tag:'err_random'},{val:'triangle',tag:'err_random'},{val:'square'},{val:'rectangle',tag:'err_random'}],
          a:2, e:'Square — 4 equal sides and 4 corners!', d:'e', s:null, h:'Count the sides — are they all the same length?'
        },
        {
          t: 'A pizza is shaped like which flat shape?',
          v: null,
          o: [{val:'triangle',tag:'err_random'},{val:'circle'},{val:'square',tag:'err_random'},{val:'rectangle',tag:'err_random'}],
          a:1, e:'Circle! A pizza is round.', d:'e', s:null, h:'A pizza is perfectly round — which shape is round?'
        },
        {
          t: 'A book cover is shaped like which flat shape?',
          v: null,
          o: [{val:'triangle',tag:'err_random'},{val:'circle',tag:'err_random'},{val:'square',tag:'err_random'},{val:'rectangle'}],
          a:3, e:'Rectangle! 4 sides — 2 long and 2 short.', d:'e', s:null, h:'4 corners, two long sides and two short sides'
        },
        {
          t: 'A door is shaped like which flat shape?',
          v: null,
          o: [{val:'triangle',tag:'err_random'},{val:'circle',tag:'err_random'},{val:'square',tag:'err_random'},{val:'rectangle'}],
          a:3, e:'Rectangle! Taller than it is wide.', d:'e', s:null, h:'Tall shape with 4 corners, sides not all equal'
        },
        {
          t: 'Which flat shape has 4 corners and all sides the SAME length?',
          v: null,
          o: [{val:'triangle',tag:'err_random'},{val:'circle',tag:'err_random'},{val:'square'},{val:'rectangle',tag:'err_random'}],
          a:2, e:'Square! All 4 sides are equal.', d:'e', s:null, h:'Every side is exactly the same length'
        },
        // ── medium — shape in context, comparisons ───────────────────────────
        {
          t: 'A clock face is shaped like which flat shape?',
          v: null,
          o: [{val:'circle'},{val:'triangle',tag:'err_random'},{val:'square',tag:'err_random'},{val:'rectangle',tag:'err_random'}],
          a:0, e:'Circle! A clock face is round.', d:'m', s:null, h:'A clock face is round — which shape is perfectly round?'
        },
        {
          t: 'A traffic warning sign has 3 corners. What shape is it?',
          v: null,
          o: [{val:'circle',tag:'err_random'},{val:'triangle'},{val:'square',tag:'err_random'},{val:'rectangle',tag:'err_random'}],
          a:1, e:'Triangle! 3 corners = triangle.', d:'m', s:null, h:'Count the corners: 1, 2, 3 — which shape has that many?'
        },
        {
          t: 'A window pane is shaped like which flat shape?',
          v: null,
          o: [{val:'circle',tag:'err_random'},{val:'triangle',tag:'err_random'},{val:'square',tag:'err_random'},{val:'rectangle'}],
          a:3, e:'Rectangle! Wider than it is tall.', d:'m', s:null, h:'4 corners, sides not all the same length'
        },
        {
          t: 'Which two shapes both have 4 corners?',
          v: null,
          o: [{val:'square and rectangle'},{val:'triangle and circle',tag:'err_random'},{val:'square and triangle',tag:'err_random'},{val:'circle and rectangle',tag:'err_random'}],
          a:0, e:'Square AND rectangle — both have 4 corners!', d:'m', s:null, h:'Which shapes have 4 corners each?'
        },
        {
          t: 'Which shape has MORE sides — a triangle or a rectangle?',
          v: null,
          o: [{val:'triangle',tag:'err_off_by_one'},{val:'rectangle'},{val:'they are the same',tag:'err_random'},{val:'circle',tag:'err_random'}],
          a:1, e:'Rectangle! Triangle has 3 sides; rectangle has 4.', d:'m', s:null, h:'Triangle = 3 sides; rectangle = 4 sides'
        },
        {
          t: 'How many sides does a rectangle have?',
          v: null,
          o: [{val:'2',tag:'err_off_by_one'},{val:'3',tag:'err_off_by_one'},{val:'4'},{val:'5',tag:'err_off_by_one'}],
          a:2, e:'4 sides! Rectangles always have 4 sides.', d:'m', s:null, h:'Count the sides: top, bottom, left, right'
        },
        {
          t: 'A yield sign has 3 corners. What shape is it?',
          v: null,
          o: [{val:'circle',tag:'err_random'},{val:'triangle'},{val:'square',tag:'err_random'},{val:'rectangle',tag:'err_random'}],
          a:1, e:'Triangle! 3 corners = triangle.', d:'m', s:null, h:'3 corners — which shape always has exactly 3?'
        },
        {
          t: 'A cheese cracker has 4 equal sides. What shape is it?',
          v: null,
          o: [{val:'circle',tag:'err_random'},{val:'triangle',tag:'err_random'},{val:'square'},{val:'rectangle',tag:'err_random'}],
          a:2, e:'Square! All 4 sides are equal.', d:'m', s:null, h:'Count the sides — are they all the same length?'
        },
        {
          t: 'Which shape has NO sides?',
          v: null,
          o: [{val:'square',tag:'err_random'},{val:'triangle',tag:'err_random'},{val:'rectangle',tag:'err_random'},{val:'circle'}],
          a:3, e:'Circle! It is round with no sides.', d:'m', s:null, h:'Round shapes have no straight sides'
        },
        {
          t: 'A ruler is shaped like which flat shape?',
          v: null,
          o: [{val:'circle',tag:'err_random'},{val:'triangle',tag:'err_random'},{val:'square',tag:'err_random'},{val:'rectangle'}],
          a:3, e:'Rectangle! Long, flat, and thin.', d:'m', s:null, h:'Long and thin with 4 sides, not all the same length'
        },
        // ── hard — orientation, comparisons, classification ──────────────────
        {
          t: 'A triangle is turned upside-down. What shape is it still?',
          v: null,
          o: [{val:'circle',tag:'err_random'},{val:'triangle'},{val:'square',tag:'err_shape_orient'},{val:'rectangle',tag:'err_shape_orient'}],
          a:1, e:'Triangle! Turning a shape does not change what it is.', d:'h', s:null, h:'Count the corners — do they change when turned?'
        },
        {
          t: 'A square is tilted sideways. What shape is it now?',
          v: null,
          o: [{val:'circle',tag:'err_random'},{val:'triangle',tag:'err_random'},{val:'diamond',tag:'err_shape_orient'},{val:'square'}],
          a:3, e:'Still a square! Tilting does not change the shape.', d:'h', s:null, h:'Count the sides — do they change when tilted?'
        },
        {
          t: 'A square is a special type of which other shape?',
          v: null,
          o: [{val:'triangle',tag:'err_random'},{val:'circle',tag:'err_random'},{val:'rectangle'},{val:'cylinder',tag:'err_random'}],
          a:2, e:'Rectangle! A square is a rectangle where all 4 sides are equal.', d:'h', s:null, h:'Both have 4 sides and 4 corners — what is the family?'
        },
        {
          t: 'How many MORE sides does a square have than a triangle?',
          v: null,
          o: [{val:'0',tag:'err_random'},{val:'1'},{val:'2',tag:'err_off_by_one'},{val:'3',tag:'err_random'}],
          a:1, e:'1 more! Square has 4, triangle has 3. 4 − 3 = 1.', d:'h', s:null, h:'Square = 4 sides; triangle = 3 sides'
        },
        {
          t: 'A rectangle and a square both have 4 sides. What makes them DIFFERENT?',
          v: null,
          o: [{val:'number of sides',tag:'err_random'},{val:'number of corners',tag:'err_random'},{val:'length of sides'},{val:'number of shapes',tag:'err_random'}],
          a:2, e:'Length of sides! A square has all equal sides. A rectangle does not.', d:'h', s:null, h:'Compare the side lengths!'
        },
        {
          t: 'Which shape has FEWER corners — a triangle or a square?',
          v: null,
          o: [{val:'triangle'},{val:'square',tag:'err_off_by_one'},{val:'they have the same',tag:'err_random'},{val:'circle',tag:'err_random'}],
          a:0, e:'Triangle! It has 3 corners; a square has 4.', d:'h', s:null, h:'Triangle = 3 corners; square = 4 corners'
        },
        {
          t: 'A shape is ROUND with no corners and no sides. What is it?',
          v: null,
          o: [{val:'triangle',tag:'err_random'},{val:'square',tag:'err_random'},{val:'circle'},{val:'rectangle',tag:'err_random'}],
          a:2, e:'Circle! Round with no corners and no sides.', d:'h', s:null, h:'Which shape is perfectly round with no corners at all?'
        },
        {
          t: 'Which of these is NOT a 2D flat shape?',
          v: null,
          o: [{val:'triangle',tag:'err_random'},{val:'circle',tag:'err_random'},{val:'cube'},{val:'square',tag:'err_random'}],
          a:2, e:'Cube! A cube is a 3D solid — you can hold it.', d:'h', s:null, h:'Which one can you hold like a box?'
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
          v: null,
          s: 'A sphere is perfectly round like a ball — no flat faces, no corners!',
          a: 'Sphere ✅'
        },
        {
          c: '#1976D2',
          tag: 'Cube',
          p: 'A box has 6 flat square faces. What solid is it?',
          v: null,
          s: 'A cube has 6 flat faces — all shaped like squares!',
          a: 'Cube ✅'
        },
        {
          c: '#0D47A1',
          tag: 'Cone',
          p: 'An ice cream cone has a pointy top and 1 flat circle at the bottom. What solid is it?',
          v: null,
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
          v: null,
          o: [{val:'cube',tag:'err_wrong_solid'},{val:'cone',tag:'err_wrong_solid'},{val:'sphere'},{val:'cylinder',tag:'err_wrong_solid'}],
          a:2, e:'Sphere! Round like a ball.', d:'e', s:null, h:'Round with no flat faces — which solid is like that?'
        },
        {
          t: 'An ice cream cone is shaped like which solid?',
          v: null,
          o: [{val:'cube',tag:'err_random'},{val:'cone'},{val:'sphere',tag:'err_random'},{val:'cylinder',tag:'err_random'}],
          a:1, e:'Cone! Pointy top, flat circle on the bottom.', d:'e', s:null, h:'Which solid has a pointy tip at the very top?'
        },
        {
          t: 'A soup can is shaped like which solid?',
          v: null,
          o: [{val:'cube',tag:'err_random'},{val:'cone',tag:'err_random'},{val:'sphere',tag:'err_random'},{val:'cylinder'}],
          a:3, e:'Cylinder! Round tube with flat circles on top and bottom.', d:'e', s:null, h:'Round tube with flat circles on each end'
        },
        {
          t: 'A block toy box is shaped like which solid?',
          v: null,
          o: [{val:'cube'},{val:'cone',tag:'err_random'},{val:'sphere',tag:'err_random'},{val:'cylinder',tag:'err_random'}],
          a:0, e:'Cube! 6 flat square faces.', d:'e', s:null, h:'6 flat square faces — like a box shape'
        },
        {
          t: 'Which solid looks like a ball?',
          v: null,
          o: [{val:'cube',tag:'err_wrong_solid'},{val:'cone',tag:'err_wrong_solid'},{val:'sphere'},{val:'cylinder',tag:'err_wrong_solid'}],
          a:2, e:'Sphere! Perfectly round like a ball.', d:'e', s:null, h:'Perfectly round — which solid has no flat parts?'
        },
        {
          t: 'Which solid looks like a soup can?',
          v: null,
          o: [{val:'cube',tag:'err_random'},{val:'cone',tag:'err_random'},{val:'cylinder'},{val:'sphere',tag:'err_random'}],
          a:2, e:'Cylinder! Round tube shape.', d:'e', s:null, h:'Round tube with flat circles on top and bottom'
        },
        {
          t: 'A globe is shaped like which solid?',
          v: null,
          o: [{val:'cube',tag:'err_wrong_solid'},{val:'cone',tag:'err_wrong_solid'},{val:'sphere'},{val:'cylinder',tag:'err_wrong_solid'}],
          a:2, e:'Sphere! A globe is round like a ball.', d:'e', s:null, h:'A globe is perfectly round — which solid is like that?'
        },
        {
          t: 'Which solid has a pointy top?',
          v: null,
          o: [{val:'cube',tag:'err_random'},{val:'cone'},{val:'sphere',tag:'err_random'},{val:'cylinder',tag:'err_random'}],
          a:1, e:'Cone! It has a pointy top and a flat circle on the bottom.', d:'e', s:null, h:'Which solid has a pointed tip at the very top?'
        },
        {
          t: 'A game die (like in board games) is shaped like which solid?',
          v: null,
          o: [{val:'cube'},{val:'cone',tag:'err_random'},{val:'sphere',tag:'err_random'},{val:'cylinder',tag:'err_random'}],
          a:0, e:'Cube! A die has 6 flat square faces.', d:'e', s:null, h:'This solid has flat square faces on every side'
        },
        {
          t: 'Which solid has all flat square faces?',
          v: null,
          o: [{val:'cube'},{val:'cone',tag:'err_random'},{val:'sphere',tag:'err_random'},{val:'cylinder',tag:'err_random'}],
          a:0, e:'Cube! Every face is a flat square.', d:'e', s:null, h:'Every flat face is a square — which solid is that?'
        },
        // ── medium — faces, surfaces, real-world ─────────────────────────────
        {
          t: 'A sphere can roll in any direction because its surface is ___?',
          v: null,
          o: [{val:'flat',tag:'err_random'},{val:'pointed',tag:'err_random'},{val:'curved'},{val:'square',tag:'err_random'}],
          a:2, e:'Curved! A round, curved surface lets it roll any direction.', d:'m', s:null, h:'What kind of surface lets things roll?'
        },
        {
          t: 'A cube has how many flat faces?',
          v: null,
          o: [{val:'4',tag:'err_off_by_one'},{val:'5',tag:'err_off_by_one'},{val:'6'},{val:'8',tag:'err_random'}],
          a:2, e:'6 flat faces! Top, bottom, front, back, left, right.', d:'m', s:null, h:'Count all the flat sides of a box'
        },
        {
          t: 'A cone has how many flat faces?',
          v: null,
          o: [{val:'0',tag:'err_off_by_one'},{val:'1'},{val:'2',tag:'err_off_by_one'},{val:'3',tag:'err_off_by_one'}],
          a:1, e:'1 flat face! The flat circle at the bottom.', d:'m', s:null, h:'Look at the bottom of a cone'
        },
        {
          t: 'A cylinder has how many flat faces?',
          v: null,
          o: [{val:'1',tag:'err_off_by_one'},{val:'2'},{val:'3',tag:'err_off_by_one'},{val:'6',tag:'err_random'}],
          a:1, e:'2 flat faces! One on top and one on the bottom.', d:'m', s:null, h:'Top face and bottom face — count them!'
        },
        {
          t: 'Which solid rolls in ANY direction on a flat floor?',
          v: null,
          o: [{val:'cube',tag:'err_random'},{val:'cone',tag:'err_random'},{val:'sphere'},{val:'cylinder',tag:'err_random'}],
          a:2, e:'Sphere! Its curved surface lets it roll any direction.', d:'m', s:null, h:'Which solid is round in every direction with no flat side?'
        },
        {
          t: 'A birthday party hat is shaped like which solid?',
          v: null,
          o: [{val:'cube',tag:'err_random'},{val:'cone'},{val:'sphere',tag:'err_random'},{val:'cylinder',tag:'err_random'}],
          a:1, e:'Cone! Pointy top and round base.', d:'m', s:null, h:'Which solid has a pointy top and a round base?'
        },
        {
          t: 'A drum is shaped most like which solid?',
          v: null,
          o: [{val:'cube',tag:'err_random'},{val:'cone',tag:'err_random'},{val:'sphere',tag:'err_random'},{val:'cylinder'}],
          a:3, e:'Cylinder! Round tube with flat circles on top and bottom.', d:'m', s:null, h:'Round tube with flat circles on each end'
        },
        {
          t: 'The flat face of a CUBE is shaped like which 2D shape?',
          v: null,
          o: [{val:'circle',tag:'err_wrong_solid'},{val:'triangle',tag:'err_random'},{val:'square'},{val:'rectangle',tag:'err_random'}],
          a:2, e:'Square! Every face of a cube is a square.', d:'m', s:null, h:'Look at one side of a cube — what shape is it?'
        },
        {
          t: 'The flat face of a CYLINDER is shaped like which 2D shape?',
          v: null,
          o: [{val:'square',tag:'err_wrong_solid'},{val:'triangle',tag:'err_random'},{val:'circle'},{val:'rectangle',tag:'err_wrong_solid'}],
          a:2, e:'Circle! Both flat faces of a cylinder are circles.', d:'m', s:null, h:'Round ends — what flat shape is round?'
        },
        {
          t: 'Which solid has NO flat faces at all?',
          v: null,
          o: [{val:'cube',tag:'err_random'},{val:'cone',tag:'err_wrong_solid'},{val:'sphere'},{val:'cylinder',tag:'err_wrong_solid'}],
          a:2, e:'Sphere! It is all curved — no flat faces.', d:'m', s:null, h:'Totally round — no flat part at all!'
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
          v: null,
          o: [{val:'4',tag:'err_off_by_one'},{val:'6',tag:'err_off_by_one'},{val:'8'},{val:'12',tag:'err_random'}],
          a:2, e:'8 corners! A cube has 8 pointy corners.', d:'h', s:null, h:'Count all the corner points on a box'
        },
        {
          t: 'Which solid has 2 flat circular faces AND 1 curved side?',
          v: null,
          o: [{val:'cube',tag:'err_wrong_solid'},{val:'cone',tag:'err_wrong_solid'},{val:'sphere',tag:'err_wrong_solid'},{val:'cylinder'}],
          a:3, e:'Cylinder! Two flat circles plus a curved middle.', d:'h', s:null, h:'Look at the top and bottom — what shape are those faces?'
        },
        {
          t: 'A cube has 6 faces. What shape is each flat face?',
          v: null,
          o: [{val:'circle',tag:'err_wrong_solid'},{val:'triangle',tag:'err_random'},{val:'square'},{val:'rectangle',tag:'err_random'}],
          a:2, e:'Square! All 6 faces of a cube are squares.', d:'h', s:null, h:'Look at one side of a cube'
        },
        {
          t: 'Which solid CANNOT roll?',
          v: null,
          o: [{val:'sphere',tag:'err_random'},{val:'cylinder',tag:'err_random'},{val:'cone',tag:'err_random'},{val:'cube'}],
          a:3, e:'Cube! Flat faces cannot roll — it just tips over.', d:'h', s:null, h:'Which solid has all flat sides with no curves?'
        },
        {
          t: 'A sphere is like a circle but it is ___?',
          v: null,
          o: [{val:'flat',tag:'err_wrong_solid'},{val:'smaller',tag:'err_random'},{val:'3D — you can hold it'},{val:'a different color',tag:'err_random'}],
          a:2, e:'3D! A sphere takes up space — you can hold it like a ball.', d:'h', s:null, h:'Can you hold it or is it just drawn flat?'
        },
        {
          t: 'A cone has 1 flat face. What 2D shape is that flat face?',
          v: null,
          o: [{val:'square',tag:'err_wrong_solid'},{val:'triangle',tag:'err_random'},{val:'circle'},{val:'rectangle',tag:'err_wrong_solid'}],
          a:2, e:'Circle! The bottom face of a cone is a circle.', d:'h', s:null, h:'Look at the round bottom of a cone'
        },
        {
          t: 'Which solid has only a curved surface — no flat faces?',
          v: null,
          o: [{val:'cube',tag:'err_random'},{val:'cone',tag:'err_wrong_solid'},{val:'cylinder',tag:'err_wrong_solid'},{val:'sphere'}],
          a:3, e:'Sphere! Totally curved — no flat part at all.', d:'h', s:null, h:'Which solid is totally curved with no flat part at all?'
        },
        {
          t: 'A cylinder can roll on its side. A cube cannot. Why?',
          v: null,
          o: [{val:'the cube is heavier',tag:'err_random'},{val:'the cylinder has a curved surface'},{val:'the cube has more faces',tag:'err_random'},{val:'the cylinder is smaller',tag:'err_random'}],
          a:1, e:'The cylinder has a curved surface! Curves let things roll.', d:'h', s:null, h:'What does a curved surface allow?'
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
          p: 'How many sides does a triangle 🔺 have?',
          v: null,
          s: 'Trace each side: 1 side, 2 sides, 3 sides. A triangle has 3 sides!',
          a: '3 sides ✅'
        },
        {
          c: '#1976D2',
          tag: 'Count the Corners',
          p: 'How many corners does a square ⬛ have?',
          v: null,
          s: 'Touch each corner: 1, 2, 3, 4. A square has 4 corners!',
          a: '4 corners ✅'
        },
        {
          c: '#0D47A1',
          tag: 'Circles are Different',
          p: 'How many corners does a circle 🔵 have?',
          v: null,
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
          v: null,
          o: [{val:'2',tag:'err_off_by_one'},{val:'3'},{val:'4',tag:'err_off_by_one'},{val:'5',tag:'err_random'}],
          a:1, e:'3 sides! Triangle always has 3.', d:'e', s:null, h:'Touch and count each side: 1, 2, 3'
        },
        {
          t: 'How many corners does a square have?',
          v: null,
          o: [{val:'2',tag:'err_off_by_one'},{val:'3',tag:'err_off_by_one'},{val:'4'},{val:'5',tag:'err_off_by_one'}],
          a:2, e:'4 corners! Touch each pointy corner: 1, 2, 3, 4.', d:'e', s:null, h:'Count each pointy corner'
        },
        {
          t: 'How many sides does a rectangle have?',
          v: null,
          o: [{val:'2',tag:'err_off_by_one'},{val:'3',tag:'err_off_by_one'},{val:'4'},{val:'5',tag:'err_off_by_one'}],
          a:2, e:'4 sides! Top, bottom, left, right.', d:'e', s:null, h:'Count each side: top, bottom, left, right'
        },
        {
          t: 'How many corners does a circle have?',
          v: null,
          o: [{val:'0'},{val:'1',tag:'err_off_by_one'},{val:'2',tag:'err_off_by_one'},{val:'4',tag:'err_random'}],
          a:0, e:'0 corners! A circle is round — no pointy corners.', d:'e', s:null, h:'Is a circle round or pointy?'
        },
        {
          t: 'How many corners does a triangle have?',
          v: null,
          o: [{val:'1',tag:'err_under_count'},{val:'2',tag:'err_off_by_one'},{val:'3'},{val:'4',tag:'err_off_by_one'}],
          a:2, e:'3 corners! Touch each corner: 1, 2, 3.', d:'e', s:null, h:'Touch each pointy corner'
        },
        {
          t: 'How many sides does a square have?',
          v: null,
          o: [{val:'2',tag:'err_off_by_one'},{val:'3',tag:'err_off_by_one'},{val:'4'},{val:'6',tag:'err_random'}],
          a:2, e:'4 sides! Trace each side: 1, 2, 3, 4.', d:'e', s:null, h:'Count each straight line side'
        },
        {
          t: 'How many sides does a circle have?',
          v: null,
          o: [{val:'0'},{val:'1',tag:'err_off_by_one'},{val:'2',tag:'err_off_by_one'},{val:'4',tag:'err_random'}],
          a:0, e:'0 sides! A circle has no straight sides.', d:'e', s:null, h:'Round shapes have no straight sides'
        },
        {
          t: 'How many corners does a rectangle have?',
          v: null,
          o: [{val:'2',tag:'err_off_by_one'},{val:'3',tag:'err_off_by_one'},{val:'4'},{val:'6',tag:'err_random'}],
          a:2, e:'4 corners! Touch each corner: 1, 2, 3, 4.', d:'e', s:null, h:'Count each corner of the rectangle'
        },
        {
          t: 'A shape with 3 sides is called a ___?',
          v: null,
          o: [{val:'circle',tag:'err_random'},{val:'square',tag:'err_random'},{val:'triangle'},{val:'rectangle',tag:'err_random'}],
          a:2, e:'Triangle! Three sides = triangle.', d:'e', s:null, h:'Three sides — tri means three!'
        },
        {
          t: 'A shape with 4 equal sides is called a ___?',
          v: null,
          o: [{val:'circle',tag:'err_random'},{val:'triangle',tag:'err_random'},{val:'rectangle',tag:'err_random'},{val:'square'}],
          a:3, e:'Square! Four equal sides = square.', d:'e', s:null, h:'4 sides all the same length — which shape is that?'
        },
        // ── medium — comparisons, identifying by attribute ───────────────────
        {
          t: 'Which shape has MORE corners — a triangle or a rectangle?',
          v: null,
          o: [{val:'triangle',tag:'err_off_by_one'},{val:'rectangle'},{val:'they have the same',tag:'err_random'},{val:'circle',tag:'err_random'}],
          a:1, e:'Rectangle! It has 4 corners; triangle has 3.', d:'m', s:null, h:'Triangle = 3 corners; rectangle = 4 corners'
        },
        {
          t: 'How many more sides does a square have than a triangle?',
          v: null,
          o: [{val:'0',tag:'err_random'},{val:'1'},{val:'2',tag:'err_off_by_one'},{val:'3',tag:'err_random'}],
          a:1, e:'1 more side! Square has 4; triangle has 3. 4 − 3 = 1.', d:'m', s:null, h:'Square = 4 sides; triangle = 3 sides'
        },
        {
          t: 'A shape has 4 corners. What shape could it be?',
          v: null,
          o: [{val:'triangle',tag:'err_random'},{val:'circle',tag:'err_random'},{val:'rectangle'},{val:'none of them',tag:'err_random'}],
          a:2, e:'Rectangle! It has 4 corners. (Square also has 4!)', d:'m', s:null, h:'Which shapes have 4 corners?'
        },
        {
          t: 'A shape has 3 sides and 3 corners. What is it?',
          v: null,
          o: [{val:'circle',tag:'err_random'},{val:'square',tag:'err_random'},{val:'triangle'},{val:'rectangle',tag:'err_random'}],
          a:2, e:'Triangle! 3 sides and 3 corners.', d:'m', s:null, h:'Which shape always has exactly 3 sides and 3 corners?'
        },
        {
          t: 'Which shape has FEWER corners — a triangle or a square?',
          v: null,
          o: [{val:'triangle'},{val:'square',tag:'err_off_by_one'},{val:'they have the same',tag:'err_random'},{val:'circle',tag:'err_random'}],
          a:0, e:'Triangle! 3 corners is fewer than 4.', d:'m', s:null, h:'Triangle = 3 corners; square = 4 corners'
        },
        {
          t: 'How many more corners does a square have than a triangle?',
          v: null,
          o: [{val:'0',tag:'err_random'},{val:'1'},{val:'2',tag:'err_off_by_one'},{val:'4',tag:'err_random'}],
          a:1, e:'1 more! Square has 4; triangle has 3. 4 − 3 = 1.', d:'m', s:null, h:'Count each, then find the difference'
        },
        {
          t: 'A shape has 4 sides but they are NOT all the same length. What is it?',
          v: null,
          o: [{val:'circle',tag:'err_random'},{val:'triangle',tag:'err_random'},{val:'square',tag:'err_random'},{val:'rectangle'}],
          a:3, e:'Rectangle! Its sides are not all equal.', d:'m', s:null, h:'Which shape has 4 sides that are not all the same length?'
        },
        {
          t: 'How many fewer corners does a triangle have than a rectangle?',
          v: null,
          o: [{val:'0',tag:'err_random'},{val:'1'},{val:'2',tag:'err_off_by_one'},{val:'3',tag:'err_random'}],
          a:1, e:'1 fewer! Rectangle has 4; triangle has 3. 4 − 3 = 1.', d:'m', s:null, h:'Rectangle = 4 corners; triangle = 3 corners'
        },
        {
          t: 'Which shape has MORE sides — a square or a triangle?',
          v: null,
          o: [{val:'triangle',tag:'err_off_by_one'},{val:'square'},{val:'they have the same',tag:'err_random'},{val:'circle',tag:'err_random'}],
          a:1, e:'Square! It has 4 sides; triangle has 3.', d:'m', s:null, h:'Square = 4 sides; triangle = 3 sides'
        },
        {
          t: 'A shape with 0 sides and 0 corners is a ___?',
          v: null,
          o: [{val:'triangle',tag:'err_random'},{val:'square',tag:'err_random'},{val:'circle'},{val:'rectangle',tag:'err_random'}],
          a:2, e:'Circle! No sides, no corners — perfectly round.', d:'m', s:null, h:'Round shape — no sides, no corners'
        },
        // ── hard — totals, comparisons, combined reasoning ───────────────────
        {
          t: 'A shape has 4 corners and all sides the SAME length. What is it?',
          v: null,
          o: [{val:'triangle',tag:'err_random'},{val:'circle',tag:'err_random'},{val:'square'},{val:'rectangle',tag:'err_random'}],
          a:2, e:'Square! 4 corners AND all sides equal.', d:'h', s:null, h:'4 corners AND all sides the exact same length'
        },
        {
          t: 'How many total sides do 2 triangles have?',
          v: null,
          o: [{val:'3',tag:'err_off_by_one'},{val:'4',tag:'err_off_by_one'},{val:'5',tag:'err_off_by_one'},{val:'6'}],
          a:3, e:'6! Each triangle has 3 sides. 3 + 3 = 6.', d:'h', s:null, h:'One triangle = 3 sides. Two triangles = ?'
        },
        {
          t: 'How many total corners do 1 square and 1 triangle have together?',
          v: null,
          o: [{val:'4',tag:'err_under_count'},{val:'5',tag:'err_off_by_one'},{val:'6',tag:'err_off_by_one'},{val:'7'}],
          a:3, e:'7! Square has 4 corners + triangle has 3 corners = 7.', d:'h', s:null, h:'Square = 4 corners; triangle = 3 corners'
        },
        {
          t: 'A shape has more than 3 corners but fewer than 5 corners. What is it?',
          v: null,
          o: [{val:'triangle',tag:'err_off_by_one'},{val:'rectangle'},{val:'circle',tag:'err_random'},{val:'pentagon',tag:'err_random'}],
          a:1, e:'Rectangle! It has exactly 4 corners — more than 3, fewer than 5.', d:'h', s:null, h:'More than 3 but fewer than 5 — what number is that?'
        },
        {
          t: 'A triangle has 3 sides. A square has 4. How many sides do they have TOGETHER?',
          v: null,
          o: [{val:'4',tag:'err_under_count'},{val:'5',tag:'err_off_by_one'},{val:'6',tag:'err_off_by_one'},{val:'7'}],
          a:3, e:'7! 3 sides + 4 sides = 7 sides together.', d:'h', s:null, h:'Add the sides: 3 + 4 = ?'
        },
        {
          t: 'A shape with 4 sides and all sides equal has ___ corners?',
          v: null,
          o: [{val:'2',tag:'err_off_by_one'},{val:'3',tag:'err_off_by_one'},{val:'4'},{val:'5',tag:'err_off_by_one'}],
          a:2, e:'4 corners! A square has 4 sides and 4 corners.', d:'h', s:null, h:'Every side meets a corner — count the sides!'
        },
        {
          t: 'How many total sides do 1 triangle and 1 rectangle have together?',
          v: null,
          o: [{val:'4',tag:'err_under_count'},{val:'5',tag:'err_off_by_one'},{val:'6',tag:'err_off_by_one'},{val:'7'}],
          a:3, e:'7! Triangle has 3 sides + rectangle has 4 sides = 7.', d:'h', s:null, h:'3 + 4 = ?'
        },
        {
          t: 'How many total corners do 2 squares have?',
          v: null,
          o: [{val:'4',tag:'err_under_count'},{val:'6',tag:'err_off_by_one'},{val:'7',tag:'err_off_by_one'},{val:'8'}],
          a:3, e:'8! Each square has 4 corners. 4 + 4 = 8.', d:'h', s:null, h:'One square = 4 corners. Two squares = ?'
        },
        {
          t: 'Which shape has MORE corners — a triangle or a circle?',
          v: null,
          o: [{val:'circle',tag:'err_random'},{val:'triangle'},{val:'they have the same',tag:'err_random'},{val:'neither has corners',tag:'err_random'}],
          a:1, e:'Triangle! It has 3 corners; circle has 0.', d:'h', s:null, h:'Circle = 0 corners; triangle = 3 corners'
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
          p: 'Sort these into groups: circle, triangle, square, rectangle. How many shapes have 4 sides?',
          v: null,
          s: 'Square and rectangle both have 4 sides. Circle has 0; triangle has 3. That is 2 shapes!',
          a: '2 shapes have 4 sides ✅'
        },
        {
          c: '#1976D2',
          tag: 'Shape Still the Same',
          p: 'A triangle is tilted to the side. Which group does it go in?',
          v: null,
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
          t: 'Which group has shapes with 4 sides?',
          v: null,
          o: [{val:'circles only',tag:'err_random'},{val:'triangles only',tag:'err_random'},{val:'squares and rectangles'},{val:'circles and triangles',tag:'err_random'}],
          a:2, e:'Squares and rectangles! Both have 4 sides.', d:'e', s:null, h:'Which shapes have 4 sides?'
        },
        {
          t: 'Which group has shapes with 3 corners?',
          v: null,
          o: [{val:'circles only',tag:'err_random'},{val:'triangles only'},{val:'squares only',tag:'err_random'},{val:'rectangles only',tag:'err_random'}],
          a:1, e:'Triangles only! Triangles have 3 corners.', d:'e', s:null, h:'Which shape always has 3 corners?'
        },
        {
          t: 'Sort by sides: circle (0), triangle (3), rectangle (4). Which has the MOST sides?',
          v: null,
          o: [{val:'circle',tag:'err_random'},{val:'triangle',tag:'err_off_by_one'},{val:'rectangle'},{val:'they are the same',tag:'err_random'}],
          a:2, e:'Rectangle! It has 4 sides — the most.', d:'e', s:null, h:'0, 3, 4 — which is biggest?'
        },
        {
          t: 'Sort by sides: circle (0), triangle (3), rectangle (4). Which has the FEWEST sides?',
          v: null,
          o: [{val:'circle'},{val:'triangle',tag:'err_off_by_one'},{val:'rectangle',tag:'err_random'},{val:'they are the same',tag:'err_random'}],
          a:0, e:'Circle! It has 0 sides — the fewest.', d:'e', s:null, h:'0, 3, 4 — which is smallest?'
        },
        {
          t: 'Which shapes would you put in the "4 corners" group?',
          v: null,
          o: [{val:'circles and triangles',tag:'err_random'},{val:'triangles only',tag:'err_random'},{val:'squares and rectangles'},{val:'circles only',tag:'err_random'}],
          a:2, e:'Squares and rectangles! Both have 4 corners.', d:'e', s:null, h:'Which shapes have 4 corners?'
        },
        {
          t: 'To draw a triangle, how many straight lines do you need?',
          v: null,
          o: [{val:'2',tag:'err_off_by_one'},{val:'3'},{val:'4',tag:'err_off_by_one'},{val:'5',tag:'err_random'}],
          a:1, e:'3 lines! One for each side of the triangle.', d:'e', s:null, h:'Count the sides of a triangle — one line for each side'
        },
        {
          t: 'To draw a square, how many straight lines do you need?',
          v: null,
          o: [{val:'2',tag:'err_off_by_one'},{val:'3',tag:'err_off_by_one'},{val:'4'},{val:'5',tag:'err_off_by_one'}],
          a:2, e:'4 lines! One for each side of the square.', d:'e', s:null, h:'Count the sides of a square — one line for each side'
        },
        {
          t: 'Which shapes have curved sides?',
          v: null,
          o: [{val:'squares and rectangles',tag:'err_random'},{val:'triangles and squares',tag:'err_random'},{val:'circles'},{val:'triangles only',tag:'err_random'}],
          a:2, e:'Circles! Circles have a curved side — no straight lines.', d:'e', s:null, h:'Which shape is round with no straight edges?'
        },
        {
          t: 'Which group of shapes all have exactly 4 corners?',
          v: null,
          o: [{val:'triangle and circle',tag:'err_random'},{val:'square and rectangle'},{val:'triangle and square',tag:'err_random'},{val:'circle and rectangle',tag:'err_random'}],
          a:1, e:'Square and rectangle! Both always have 4 corners.', d:'e', s:null, h:'Which shapes have 4 corners each?'
        },
        {
          t: 'Which shape can you make by drawing 3 connected straight lines?',
          v: null,
          o: [{val:'circle',tag:'err_random'},{val:'triangle'},{val:'square',tag:'err_random'},{val:'rectangle',tag:'err_random'}],
          a:1, e:'Triangle! 3 straight lines make a triangle.', d:'e', s:null, h:'Count the sides — which shape has that many?'
        },
        // ── medium — sorting rules, 2D vs 3D, creating ───────────────────────
        {
          t: 'Sort from fewest to most corners. Which shape comes LAST: circle, triangle, rectangle?',
          v: null,
          o: [{val:'circle',tag:'err_random'},{val:'triangle',tag:'err_off_by_one'},{val:'rectangle'},{val:'square',tag:'err_random'}],
          a:2, e:'Rectangle! Circle has 0, triangle has 3, rectangle has 4 — most!', d:'m', s:null, h:'0, 3, 4 — which comes last?'
        },
        {
          t: 'If you sort shapes into "round" and "not round", where does a triangle go?',
          v: null,
          o: [{val:'round',tag:'err_random'},{val:'not round'},{val:'both groups',tag:'err_random'},{val:'neither group',tag:'err_random'}],
          a:1, e:'Not round! A triangle has straight sides and corners.', d:'m', s:null, h:'Is a triangle curved or straight?'
        },
        {
          t: 'Which shapes would you put in the "3 sides" group?',
          v: null,
          o: [{val:'circles',tag:'err_random'},{val:'squares',tag:'err_random'},{val:'triangles'},{val:'rectangles',tag:'err_random'}],
          a:2, e:'Triangles! They always have 3 sides.', d:'m', s:null, h:'Three sides — which shape is that?'
        },
        {
          t: 'A shape has 4 equal sides. You build it with sticks. How many sticks do you need?',
          v: null,
          o: [{val:'3',tag:'err_off_by_one'},{val:'4'},{val:'5',tag:'err_off_by_one'},{val:'6',tag:'err_random'}],
          a:1, e:'4 sticks! One stick for each side of the square.', d:'m', s:null, h:'4 equal sides = 4 sticks'
        },
        {
          t: 'You sort shapes as "flat" or "3D solid". Where does a cube go?',
          v: null,
          o: [{val:'flat',tag:'err_wrong_solid'},{val:'3D solid'},{val:'both',tag:'err_random'},{val:'neither',tag:'err_random'}],
          a:1, e:'3D solid! You can hold a cube in your hands.', d:'m', s:null, h:'Can you hold a cube in your hands?'
        },
        {
          t: 'You sort shapes as "flat" or "3D solid". Where does a circle go?',
          v: null,
          o: [{val:'flat'},{val:'3D solid',tag:'err_wrong_solid'},{val:'both',tag:'err_random'},{val:'neither',tag:'err_random'}],
          a:0, e:'Flat! A circle is drawn on paper — it has no depth.', d:'m', s:null, h:'Can you hold a circle or is it just drawn?'
        },
        {
          t: 'Which shapes go together because they have ROUND sides?',
          v: null,
          o: [{val:'triangle and square',tag:'err_random'},{val:'circle and sphere'},{val:'square and cube',tag:'err_random'},{val:'triangle and cone',tag:'err_random'}],
          a:1, e:'Circle and sphere! Both have round curved surfaces.', d:'m', s:null, h:'Which shapes are round?'
        },
        {
          t: 'Sort into "fewer than 4 sides" and "4 or more sides". Where does a triangle go?',
          v: null,
          o: [{val:'4 or more sides',tag:'err_off_by_one'},{val:'fewer than 4 sides'},{val:'both groups',tag:'err_random'},{val:'neither group',tag:'err_random'}],
          a:1, e:'Fewer than 4 sides! Triangle has 3 sides — fewer than 4.', d:'m', s:null, h:'Triangle has 3 sides. Is 3 fewer than 4?'
        },
        {
          t: 'A child wants to draw a rectangle. How many lines do they need to draw?',
          v: null,
          o: [{val:'2',tag:'err_off_by_one'},{val:'3',tag:'err_off_by_one'},{val:'4'},{val:'5',tag:'err_off_by_one'}],
          a:2, e:'4 lines! One for each side of the rectangle.', d:'m', s:null, h:'Count the sides of a rectangle — one line for each side'
        },
        {
          t: 'Which two shapes both belong in the "no corners" group?',
          v: null,
          o: [{val:'square and rectangle',tag:'err_random'},{val:'triangle and circle',tag:'err_random'},{val:'circle and sphere'},{val:'triangle and rectangle',tag:'err_random'}],
          a:2, e:'Circle and sphere! Both are round with no corners.', d:'m', s:null, h:'Which shapes have no corners at all?'
        },
        // ── hard — orientation, multi-step sorting, attributes ───────────────
        {
          t: 'A tilted triangle is sorted with which group?',
          v: null,
          o: [{val:'squares — it looks like one tilted',tag:'err_shape_orient'},{val:'triangles — shape does not change when tilted'},{val:'circles — it has round edges',tag:'err_random'},{val:'rectangles — it has 4 corners',tag:'err_random'}],
          a:1, e:'Triangles! Turning a shape does not change what it is.', d:'h', s:null, h:'Count the corners — does that change when tilted?'
        },
        {
          t: 'Sort: circle, square, triangle, rectangle. How many shapes go in the "4 or more sides" group?',
          v: null,
          o: [{val:'1',tag:'err_off_by_one'},{val:'2'},{val:'3',tag:'err_off_by_one'},{val:'4',tag:'err_random'}],
          a:1, e:'2 shapes! Square (4 sides) and rectangle (4 sides).', d:'h', s:null, h:'Circle = 0, triangle = 3, square = 4, rectangle = 4'
        },
        {
          t: 'Which attribute can you use to sort circles, squares, and triangles into DIFFERENT groups?',
          v: null,
          o: [{val:'color',tag:'err_random'},{val:'size',tag:'err_random'},{val:'number of sides'},{val:'number of letters in the name',tag:'err_random'}],
          a:2, e:'Number of sides! Circle = 0, triangle = 3, square = 4 — all different!', d:'h', s:null, h:'What is different about circle, triangle, and square?'
        },
        {
          t: 'A child draws 4 lines of equal length connected at corners. What shape did they make?',
          v: null,
          o: [{val:'circle',tag:'err_random'},{val:'triangle',tag:'err_off_by_one'},{val:'rectangle',tag:'err_random'},{val:'square'}],
          a:3, e:'Square! 4 equal sides connected at corners = square.', d:'h', s:null, h:'4 equal sides all connected at corners — which shape?'
        },
        {
          t: 'Sort 3D solids: sphere, cube, cone, cylinder. Which group has ONLY flat faces (no curved surface)?',
          v: null,
          o: [{val:'sphere and cylinder',tag:'err_wrong_solid'},{val:'cube only'},{val:'cone and cube',tag:'err_wrong_solid'},{val:'cylinder and cone',tag:'err_wrong_solid'}],
          a:1, e:'Cube only! All 6 of its faces are flat.', d:'h', s:null, h:'Which solid has ONLY flat faces?'
        },
        {
          t: 'To make a circle, you draw a shape with ___?',
          v: null,
          o: [{val:'3 straight lines',tag:'err_random'},{val:'4 straight lines',tag:'err_random'},{val:'no straight lines — one curved line'},{val:'1 straight line',tag:'err_random'}],
          a:2, e:'No straight lines! A circle is one smooth curved line.', d:'h', s:null, h:'Is a circle made of straight lines or a curve?'
        },
        {
          t: 'Sort: square, triangle, circle, rectangle. How many shapes have fewer than 4 corners?',
          v: null,
          o: [{val:'1',tag:'err_off_by_one'},{val:'2'},{val:'3',tag:'err_off_by_one'},{val:'4',tag:'err_random'}],
          a:1, e:'2 shapes! Circle (0 corners) and triangle (3 corners).', d:'h', s:null, h:'Circle = 0, triangle = 3, square = 4, rectangle = 4'
        },
        {
          t: 'A shape is sorted into the "more than 3 corners" group. What shape could it be?',
          v: null,
          o: [{val:'triangle',tag:'err_off_by_one'},{val:'circle',tag:'err_random'},{val:'rectangle'},{val:'none of these',tag:'err_random'}],
          a:2, e:'Rectangle! It has 4 corners — more than 3.', d:'h', s:null, h:'Which shape has more than 3 corners?'
        }
      ]
    }

  ],

  testBank: [
    // ── 2D Shapes (K.6A) ─────────────────────────────────────────────────────
    {
      t: 'A triangle has ___ sides.',
      v: null,
      o: [{val:'2',tag:'err_off_by_one'},{val:'3'},{val:'4',tag:'err_off_by_one'},{val:'5',tag:'err_random'}],
      a:1, e:'3 sides! Triangle always has 3.', d:'e', s:null, h:'Count: 1 side, 2 sides, 3 sides'
    },
    {
      t: 'Name the flat shape that is perfectly round.',
      v: null,
      o: [{val:'triangle',tag:'err_random'},{val:'square',tag:'err_random'},{val:'circle'},{val:'rectangle',tag:'err_random'}],
      a:2, e:'Circle! Perfectly round with no corners.', d:'e', s:null, h:'Which shape is round?'
    },
    {
      t: 'A window has 4 corners, 2 long sides, and 2 short sides. What shape is it?',
      v: null,
      o: [{val:'triangle',tag:'err_random'},{val:'circle',tag:'err_random'},{val:'square',tag:'err_random'},{val:'rectangle'}],
      a:3, e:'Rectangle! 4 sides that are not all equal.', d:'e', s:null, h:'4 corners and sides that are not all the same length'
    },
    {
      t: 'A coin is shaped like which flat shape?',
      v: null,
      o: [{val:'triangle',tag:'err_random'},{val:'circle'},{val:'square',tag:'err_random'},{val:'rectangle',tag:'err_random'}],
      a:1, e:'Circle! A coin is round.', d:'e', s:null, h:'A coin is perfectly round — which shape has no corners?'
    },
    {
      t: 'A tile floor has square tiles. A square has how many sides?',
      v: null,
      o: [{val:'2',tag:'err_off_by_one'},{val:'3',tag:'err_off_by_one'},{val:'4'},{val:'5',tag:'err_off_by_one'}],
      a:2, e:'4 sides! A square always has 4.', d:'e', s:null, h:'Count each side of the square'
    },
    {
      t: 'A slice of pie has 3 sides. What shape is it?',
      v: null,
      o: [{val:'circle',tag:'err_random'},{val:'triangle'},{val:'square',tag:'err_random'},{val:'rectangle',tag:'err_random'}],
      a:1, e:'Triangle! 3 sides = triangle.', d:'m', s:null, h:'Which shape has exactly 3 sides?'
    },
    {
      t: 'A kite has 4 sides. Which shape also has 4 sides?',
      v: null,
      o: [{val:'triangle',tag:'err_off_by_one'},{val:'circle',tag:'err_random'},{val:'rectangle'},{val:'none of them',tag:'err_random'}],
      a:2, e:'Rectangle! It also has 4 sides.', d:'m', s:null, h:'Which shape has 4 sides?'
    },
    {
      t: 'All squares have 4 equal sides. A shape with 4 equal sides is a ___?',
      v: null,
      o: [{val:'circle',tag:'err_random'},{val:'triangle',tag:'err_random'},{val:'square'},{val:'rectangle',tag:'err_random'}],
      a:2, e:'Square! Four equal sides = square.', d:'m', s:null, h:'4 sides all exactly the same length'
    },
    {
      t: 'Which shape is both a rectangle AND has all sides equal?',
      v: null,
      o: [{val:'triangle',tag:'err_random'},{val:'circle',tag:'err_random'},{val:'rectangle',tag:'err_random'},{val:'square'}],
      a:3, e:'Square! A square is a rectangle where all sides are equal.', d:'m', s:null, h:'4 equal sides AND 4 corners'
    },
    {
      t: 'Shapes do not change when you turn them. A turned triangle is still a ___?',
      v: null,
      o: [{val:'circle',tag:'err_random'},{val:'triangle'},{val:'square',tag:'err_shape_orient'},{val:'rectangle',tag:'err_shape_orient'}],
      a:1, e:'Triangle! Turning never changes what a shape is.', d:'h', s:null, h:'Count the corners — do they change when turned?'
    },
    {
      t: 'Which shape cannot be made with any straight lines?',
      v: null,
      o: [{val:'triangle',tag:'err_random'},{val:'square',tag:'err_random'},{val:'circle'},{val:'rectangle',tag:'err_random'}],
      a:2, e:'Circle! It has no straight lines — just one smooth curve.', d:'m', s:null, h:'Which shape is made of curves, not lines?'
    },
    {
      t: 'A shape has 3 corners. It has ___ sides?',
      v: null,
      o: [{val:'2',tag:'err_off_by_one'},{val:'3'},{val:'4',tag:'err_off_by_one'},{val:'5',tag:'err_random'}],
      a:1, e:'3 sides! Triangles have 3 corners AND 3 sides.', d:'m', s:null, h:'Corners and sides are equal in triangles'
    },
    {
      t: 'How many sides do 1 triangle and 1 circle have TOGETHER?',
      v: null,
      o: [{val:'0',tag:'err_under_count'},{val:'1',tag:'err_under_count'},{val:'3'},{val:'4',tag:'err_off_by_one'}],
      a:2, e:'3! Triangle has 3 sides; circle has 0. 3 + 0 = 3.', d:'h', s:null, h:'Triangle = 3 sides; circle = 0 sides'
    },
    // ── 3D Solids (K.6B, K.6C) ───────────────────────────────────────────────
    {
      t: 'A marble is shaped like which solid?',
      v: null,
      o: [{val:'cube',tag:'err_wrong_solid'},{val:'cone',tag:'err_wrong_solid'},{val:'sphere'},{val:'cylinder',tag:'err_wrong_solid'}],
      a:2, e:'Sphere! A marble is perfectly round.', d:'e', s:null, h:'Perfectly round like a ball — which solid has no flat parts?'
    },
    {
      t: 'A paper towel roll is shaped like which solid?',
      v: null,
      o: [{val:'cube',tag:'err_random'},{val:'cone',tag:'err_random'},{val:'sphere',tag:'err_random'},{val:'cylinder'}],
      a:3, e:'Cylinder! Round tube with flat circles on top and bottom.', d:'e', s:null, h:'Round tube with flat circles on each end'
    },
    {
      t: 'A traffic cone is shaped like which solid?',
      v: null,
      o: [{val:'cube',tag:'err_random'},{val:'cone'},{val:'sphere',tag:'err_random'},{val:'cylinder',tag:'err_random'}],
      a:1, e:'Cone! Pointy top and flat circle at the bottom.', d:'e', s:null, h:'Pointy at the top, flat circle at the bottom'
    },
    {
      t: 'A building block (cube) — how many corners does it have?',
      v: null,
      o: [{val:'4',tag:'err_off_by_one'},{val:'6',tag:'err_off_by_one'},{val:'8'},{val:'12',tag:'err_random'}],
      a:2, e:'8 corners! Count every corner on the block.', d:'m', s:null, h:'Count every pointy corner on a box'
    },
    {
      t: 'Which solid has 1 curved surface and no flat faces?',
      v: null,
      o: [{val:'cube',tag:'err_random'},{val:'cone',tag:'err_wrong_solid'},{val:'sphere'},{val:'cylinder',tag:'err_wrong_solid'}],
      a:2, e:'Sphere! All curved — no flat faces at all.', d:'m', s:null, h:'Totally round — no flat faces!'
    },
    {
      t: 'Which solid has exactly 1 flat face?',
      v: null,
      o: [{val:'sphere',tag:'err_random'},{val:'cone'},{val:'cylinder',tag:'err_off_by_one'},{val:'cube',tag:'err_random'}],
      a:1, e:'Cone! Just one flat circle at the bottom.', d:'m', s:null, h:'Pointy top, one flat circle on the bottom'
    },
    {
      t: 'The flat end of a cylinder is shaped like a ___?',
      v: null,
      o: [{val:'square',tag:'err_wrong_solid'},{val:'triangle',tag:'err_random'},{val:'circle'},{val:'rectangle',tag:'err_wrong_solid'}],
      a:2, e:'Circle! The top and bottom of a cylinder are circles.', d:'m', s:null, h:'Round end — what 2D shape is round?'
    },
    {
      t: 'Which solid has 6 equal square faces?',
      v: null,
      o: [{val:'sphere',tag:'err_random'},{val:'cone',tag:'err_random'},{val:'cylinder',tag:'err_random'},{val:'cube'}],
      a:3, e:'Cube! Every face is a square — 6 total.', d:'m', s:null, h:'6 flat square faces — which solid has all square sides?'
    },
    {
      t: 'A sphere looks like a circle but is different because ___?',
      v: null,
      o: [{val:'it is flat',tag:'err_wrong_solid'},{val:'it has corners',tag:'err_random'},{val:'it is 3D — you can hold it'},{val:'it has 4 faces',tag:'err_random'}],
      a:2, e:'It is 3D! A sphere takes up space — you can hold it like a ball.', d:'h', s:null, h:'Can you hold it or is it flat on paper?'
    },
    {
      t: 'A cone has 1 flat face. A cylinder has ___ flat faces?',
      v: null,
      o: [{val:'0',tag:'err_off_by_one'},{val:'1',tag:'err_off_by_one'},{val:'2'},{val:'6',tag:'err_random'}],
      a:2, e:'2 flat faces! One circle on top and one on the bottom.', d:'h', s:null, h:'Top circle + bottom circle = ?'
    },
    {
      t: 'Which solid would you use to trace a circle?',
      v: null,
      o: [{val:'cube',tag:'err_wrong_solid'},{val:'cone'},{val:'sphere',tag:'err_wrong_solid'},{val:'rectangle',tag:'err_random'}],
      a:1, e:'Cone! Its flat face is a circle — trace around it.', d:'h', s:null, h:'Which solid has a flat circular face?'
    },
    {
      t: 'Which solid would you use to trace a square?',
      v: null,
      o: [{val:'sphere',tag:'err_wrong_solid'},{val:'cone',tag:'err_wrong_solid'},{val:'cylinder',tag:'err_wrong_solid'},{val:'cube'}],
      a:3, e:'Cube! Its flat face is a square — trace around it.', d:'h', s:null, h:'Which solid has flat square faces?'
    },
    // ── Shape Attributes (K.6D) ───────────────────────────────────────────────
    {
      t: 'Which shape has zero corners?',
      v: null,
      o: [{val:'square',tag:'err_random'},{val:'triangle',tag:'err_random'},{val:'circle'},{val:'rectangle',tag:'err_random'}],
      a:2, e:'Circle! No corners at all.', d:'e', s:null, h:'Round shapes have no corners'
    },
    {
      t: 'A triangle has ___ corners.',
      v: null,
      o: [{val:'2',tag:'err_off_by_one'},{val:'3'},{val:'4',tag:'err_off_by_one'},{val:'5',tag:'err_random'}],
      a:1, e:'3 corners! Touch each corner: 1, 2, 3.', d:'e', s:null, h:'Count each pointy corner'
    },
    {
      t: 'A square has ___ sides.',
      v: null,
      o: [{val:'2',tag:'err_off_by_one'},{val:'3',tag:'err_off_by_one'},{val:'4'},{val:'5',tag:'err_off_by_one'}],
      a:2, e:'4 sides! Squares always have 4.', d:'e', s:null, h:'Count each side of the square'
    },
    {
      t: 'A circle has ___ sides.',
      v: null,
      o: [{val:'0'},{val:'1',tag:'err_off_by_one'},{val:'2',tag:'err_off_by_one'},{val:'4',tag:'err_random'}],
      a:0, e:'0 sides! A circle has no straight sides.', d:'e', s:null, h:'A circle is round — no straight sides!'
    },
    {
      t: 'A rectangle has ___ corners.',
      v: null,
      o: [{val:'2',tag:'err_off_by_one'},{val:'3',tag:'err_off_by_one'},{val:'4'},{val:'5',tag:'err_off_by_one'}],
      a:2, e:'4 corners! Rectangles always have 4.', d:'m', s:null, h:'Touch each corner: 1, 2, 3, 4'
    },
    {
      t: 'Which shape has 4 corners AND 4 sides of equal length?',
      v: null,
      o: [{val:'triangle',tag:'err_random'},{val:'circle',tag:'err_random'},{val:'rectangle',tag:'err_random'},{val:'square'}],
      a:3, e:'Square! 4 corners and all sides equal.', d:'m', s:null, h:'Equal sides AND 4 corners'
    },
    {
      t: 'A rectangle has 2 long sides and 2 short sides. How many sides total?',
      v: null,
      o: [{val:'2',tag:'err_off_by_one'},{val:'3',tag:'err_off_by_one'},{val:'4'},{val:'5',tag:'err_off_by_one'}],
      a:2, e:'4 sides! 2 long + 2 short = 4 total.', d:'m', s:null, h:'2 long + 2 short sides = ?'
    },
    {
      t: 'A shape has more than 3 corners but fewer than 5. What is it?',
      v: null,
      o: [{val:'triangle',tag:'err_off_by_one'},{val:'circle',tag:'err_random'},{val:'rectangle'},{val:'hexagon',tag:'err_random'}],
      a:2, e:'Rectangle! It has exactly 4 corners.', d:'h', s:null, h:'More than 3 but fewer than 5 — what number?'
    },
    {
      t: 'How many corners do a triangle and a square have TOGETHER?',
      v: null,
      o: [{val:'4',tag:'err_under_count'},{val:'5',tag:'err_off_by_one'},{val:'6',tag:'err_off_by_one'},{val:'7'}],
      a:3, e:'7! Triangle = 3 corners + square = 4 corners. 3 + 4 = 7.', d:'h', s:null, h:'3 + 4 = ?'
    },
    {
      t: 'Which two shapes have the SAME number of sides?',
      v: null,
      o: [{val:'triangle and square',tag:'err_off_by_one'},{val:'circle and triangle',tag:'err_random'},{val:'square and rectangle'},{val:'triangle and circle',tag:'err_random'}],
      a:2, e:'Square and rectangle! Both have 4 sides.', d:'h', s:null, h:'Which two shapes both have 4 sides?'
    },
    {
      t: 'A shape with exactly 4 corners can be a square or a ___?',
      v: null,
      o: [{val:'triangle',tag:'err_random'},{val:'circle',tag:'err_random'},{val:'rectangle'},{val:'sphere',tag:'err_random'}],
      a:2, e:'Rectangle! Squares and rectangles both have 4 corners.', d:'m', s:null, h:'Which other shape has 4 corners?'
    },
    {
      t: 'How many sides do 2 squares have altogether?',
      v: null,
      o: [{val:'4',tag:'err_under_count'},{val:'6',tag:'err_off_by_one'},{val:'7',tag:'err_off_by_one'},{val:'8'}],
      a:3, e:'8! Each square has 4 sides. 4 + 4 = 8.', d:'h', s:null, h:'One square = 4 sides. Two squares = ?'
    },
    // ── Sort & Create (K.6E, K.6F) ───────────────────────────────────────────
    {
      t: 'Which group would you sort triangles into?',
      v: null,
      o: [{val:'0 sides',tag:'err_random'},{val:'2 sides',tag:'err_off_by_one'},{val:'3 sides'},{val:'4 sides',tag:'err_off_by_one'}],
      a:2, e:'3 sides! Triangles always have 3 sides.', d:'e', s:null, h:'Triangle = 3 sides!'
    },
    {
      t: 'Which group would you sort circles into?',
      v: null,
      o: [{val:'3 corners',tag:'err_random'},{val:'4 corners',tag:'err_random'},{val:'no corners'},{val:'1 corner',tag:'err_random'}],
      a:2, e:'No corners! Circles have zero corners.', d:'e', s:null, h:'Circles are round — no corners!'
    },
    {
      t: 'Which group would you sort cubes into?',
      v: null,
      o: [{val:'flat shapes',tag:'err_wrong_solid'},{val:'3D solids'},{val:'curved shapes',tag:'err_random'},{val:'shapes with no corners',tag:'err_random'}],
      a:1, e:'3D solids! A cube takes up space — you can hold it.', d:'e', s:null, h:'Can you hold a cube?'
    },
    {
      t: 'To draw a circle, you draw ___?',
      v: null,
      o: [{val:'3 straight lines',tag:'err_random'},{val:'4 straight lines',tag:'err_random'},{val:'no straight lines — a smooth curve'},{val:'1 straight line',tag:'err_random'}],
      a:2, e:'A smooth curve! A circle has no straight lines.', d:'m', s:null, h:'Circles have curves, not straight lines!'
    },
    {
      t: 'A rectangle and a square are sorted together. What is the SAME about them?',
      v: null,
      o: [{val:'sides are all equal',tag:'err_random'},{val:'both are round',tag:'err_random'},{val:'both have 4 sides and 4 corners'},{val:'both have 3 corners',tag:'err_random'}],
      a:2, e:'Both have 4 sides and 4 corners!', d:'m', s:null, h:'How many sides and corners do each have?'
    },
    {
      t: 'A child sorts circle and sphere together. Why do they belong together?',
      v: null,
      o: [{val:'both have corners',tag:'err_random'},{val:'both are flat',tag:'err_wrong_solid'},{val:'both are round with curved surfaces'},{val:'both have 4 sides',tag:'err_random'}],
      a:2, e:'Both are round! Circle is round and flat; sphere is round and 3D.', d:'m', s:null, h:'What do circles and spheres have in common?'
    },
    {
      t: 'Sort: triangle, sphere, circle, cube. How many are flat 2D shapes?',
      v: null,
      o: [{val:'1',tag:'err_off_by_one'},{val:'2'},{val:'3',tag:'err_off_by_one'},{val:'4',tag:'err_random'}],
      a:1, e:'2 flat shapes! Triangle and circle are flat. Sphere and cube are 3D.', d:'m', s:null, h:'Which can be drawn flat on paper?'
    },
    {
      t: 'You draw a shape with 4 lines of equal length connected at corners. What shape did you make?',
      v: null,
      o: [{val:'circle',tag:'err_random'},{val:'triangle',tag:'err_off_by_one'},{val:'rectangle',tag:'err_random'},{val:'square'}],
      a:3, e:'Square! 4 equal lines connected at corners = square.', d:'m', s:null, h:'4 equal sides = square!'
    },
    {
      t: 'A shape is placed upside-down but you still sort it as a triangle. Why?',
      v: null,
      o: [{val:'it has no sides when flipped',tag:'err_shape_orient'},{val:'its sides and corners stay the same'},{val:'it becomes a square when flipped',tag:'err_shape_orient'},{val:'you cannot sort a flipped shape',tag:'err_random'}],
      a:1, e:'Sides and corners stay the same! Turning never changes what a shape is.', d:'h', s:null, h:'Does turning a shape change how many corners it has?'
    },
    {
      t: 'Sort: sphere, cube, cone, triangle. How many are 3D solids?',
      v: null,
      o: [{val:'1',tag:'err_under_count'},{val:'2',tag:'err_off_by_one'},{val:'3'},{val:'4',tag:'err_random'}],
      a:2, e:'3 solids! Sphere, cube, and cone — all 3D. Triangle is flat.', d:'h', s:null, h:'Sphere, cube, cone — can you hold them?'
    },
    {
      t: 'Which sorting rule correctly separates triangles from rectangles?',
      v: null,
      o: [{val:'by color',tag:'err_random'},{val:'by size',tag:'err_random'},{val:'by number of sides'},{val:'by which is taller',tag:'err_random'}],
      a:2, e:'By number of sides! Triangle has 3; rectangle has 4.', d:'h', s:null, h:'What is always different about triangles and rectangles?'
    },
    {
      t: 'Which shape from this list has the MOST sides: circle, triangle, rectangle?',
      v: null,
      o: [{val:'circle',tag:'err_random'},{val:'triangle',tag:'err_off_by_one'},{val:'rectangle'},{val:'they all have the same',tag:'err_random'}],
      a:2, e:'Rectangle! Circle = 0, triangle = 3, rectangle = 4 — rectangle has the most.', d:'h', s:null, h:'Circle = 0, triangle = 3, rectangle = 4'
    }
  ]
});
