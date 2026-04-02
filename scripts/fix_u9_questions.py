"""Rewrite all fragment questions in Unit 9 (Geometry) and add shape SVGs."""
import math

# ── SVG helpers ──────────────────────────────────────────────────────────────

def poly_svg(n, w=70, h=70, fill='#e8d5f5', stroke='#6c3483'):
    cx, cy = w/2, h/2
    r = min(w,h)/2 - 6
    pts = ' '.join(
        f'{cx+r*math.cos(math.radians(i*360/n-90)):.1f},'
        f'{cy+r*math.sin(math.radians(i*360/n-90)):.1f}'
        for i in range(n)
    )
    return (f'<svg width="{w}" height="{h}" viewBox="0 0 {w} {h}" '
            f'style="display:inline-block;vertical-align:middle;margin:0 5px">'
            f'<polygon points="{pts}" fill="{fill}" stroke="{stroke}" stroke-width="2.5"/>'
            f'</svg>')

def cube_svg(w=88, h=78):
    return (f'<svg width="{w}" height="{h}" viewBox="0 0 88 78" '
            f'style="display:inline-block;vertical-align:middle;margin:0 5px">'
            '<polygon points="44,4 77,22 44,40 11,22" fill="#d7bde2" stroke="#6c3483" stroke-width="2"/>'
            '<polygon points="11,22 44,40 44,68 11,50" fill="#a569bd" stroke="#6c3483" stroke-width="2"/>'
            '<polygon points="44,40 77,22 77,50 44,68" fill="#8e44ad" stroke="#6c3483" stroke-width="2"/>'
            '</svg>')

def cylinder_svg(w=72, h=82):
    return (f'<svg width="{w}" height="{h}" viewBox="0 0 72 82" '
            f'style="display:inline-block;vertical-align:middle;margin:0 5px">'
            '<rect x="9" y="24" width="54" height="44" fill="#aed6f1" stroke="#2980b9" stroke-width="2"/>'
            '<ellipse cx="36" cy="68" rx="27" ry="10" fill="#85c1e9" stroke="#2980b9" stroke-width="2"/>'
            '<ellipse cx="36" cy="24" rx="27" ry="10" fill="#d6eaf8" stroke="#2980b9" stroke-width="2"/>'
            '</svg>')

def cone_svg(w=72, h=82):
    return (f'<svg width="{w}" height="{h}" viewBox="0 0 72 82" '
            f'style="display:inline-block;vertical-align:middle;margin:0 5px">'
            '<polygon points="36,4 7,70 65,70" fill="#f9e79f" stroke="#f39c12" stroke-width="2"/>'
            '<ellipse cx="36" cy="70" rx="29" ry="9" fill="#f7dc6f" stroke="#f39c12" stroke-width="2"/>'
            '</svg>')

def pyramid_svg(w=82, h=76):
    return (f'<svg width="{w}" height="{h}" viewBox="0 0 82 76" '
            f'style="display:inline-block;vertical-align:middle;margin:0 5px">'
            '<polygon points="41,4 9,63 73,63" fill="#aed6f1" stroke="#2980b9" stroke-width="2"/>'
            '<polygon points="9,63 41,63 41,4" fill="#7fb3d3" stroke="#2980b9" stroke-width="2"/>'
            '<polygon points="9,63 73,63 73,70 9,70" fill="#5d8aa8" stroke="#2980b9" stroke-width="2"/>'
            '</svg>')

def sphere_svg(w=72, h=72):
    return (f'<svg width="{w}" height="{h}" viewBox="0 0 72 72" '
            f'style="display:inline-block;vertical-align:middle;margin:0 5px">'
            '<circle cx="36" cy="36" r="30" fill="#d7bde2" stroke="#6c3483" stroke-width="2"/>'
            '<ellipse cx="36" cy="36" rx="30" ry="10" fill="none" stroke="#8e44ad" stroke-width="1.5" opacity="0.5"/>'
            '<ellipse cx="36" cy="36" rx="10" ry="30" fill="none" stroke="#8e44ad" stroke-width="1.5" opacity="0.5"/>'
            '</svg>')

def rect_sym_svg(w=108, h=66):
    return (f'<svg width="{w}" height="{h}" viewBox="0 0 108 66" '
            f'style="display:inline-block;vertical-align:middle;margin:0 5px">'
            '<rect x="7" y="10" width="94" height="46" fill="#fde8d8" stroke="#e67e22" stroke-width="2"/>'
            '<line x1="54" y1="4" x2="54" y2="62" stroke="#e74c3c" stroke-width="2" stroke-dasharray="5,3"/>'
            '<line x1="2" y1="33" x2="106" y2="33" stroke="#e74c3c" stroke-width="2" stroke-dasharray="5,3"/>'
            '</svg>')

def square_sym_svg(w=82, h=82):
    return (f'<svg width="{w}" height="{h}" viewBox="0 0 82 82" '
            f'style="display:inline-block;vertical-align:middle;margin:0 5px">'
            '<rect x="11" y="11" width="60" height="60" fill="#fde8d8" stroke="#e67e22" stroke-width="2"/>'
            '<line x1="41" y1="4" x2="41" y2="78" stroke="#e74c3c" stroke-width="2" stroke-dasharray="5,3"/>'
            '<line x1="4" y1="41" x2="78" y2="41" stroke="#e74c3c" stroke-width="2" stroke-dasharray="5,3"/>'
            '<line x1="7" y1="7" x2="75" y2="75" stroke="#e74c3c" stroke-width="2" stroke-dasharray="5,3"/>'
            '<line x1="75" y1="7" x2="7" y2="75" stroke="#e74c3c" stroke-width="2" stroke-dasharray="5,3"/>'
            '</svg>')

def tri_sym_svg(w=82, h=76):
    return (f'<svg width="{w}" height="{h}" viewBox="0 0 82 76" '
            f'style="display:inline-block;vertical-align:middle;margin:0 5px">'
            '<polygon points="41,4 6,72 76,72" fill="#fde8d8" stroke="#e67e22" stroke-width="2"/>'
            '<line x1="41" y1="2" x2="41" y2="74" stroke="#e74c3c" stroke-width="2" stroke-dasharray="5,3"/>'
            '</svg>')

# Verify no single quotes in any SVG
for name, fn in [('poly3',poly_svg(3)),('poly5',poly_svg(5)),('poly6',poly_svg(6)),
                 ('poly8',poly_svg(8)),('cube',cube_svg()),('cyl',cylinder_svg()),
                 ('cone',cone_svg()),('pyr',pyramid_svg()),('sph',sphere_svg()),
                 ('rsym',rect_sym_svg()),('sqsym',square_sym_svg()),('trsym',tri_sym_svg())]:
    if "'" in fn:
        print(f"WARNING single quote in {name}!")
print("SVG check done.")

# ── Rewrites: (old_question_text, new_question_text, svg_string) ─────────────
# svg_string is appended to the new text inside the q('...') field

REWRITES = [

  # ── L1: Flat Shapes ──────────────────────────────────────────────────────

  ("3 sides, 3 corners \u2014 shape?",
   "A shape has 3 sides and 3 corners. What shape is it?",
   poly_svg(3)),

  ("Pentagon sides?",
   "How many sides does a pentagon have?",
   poly_svg(5)),

  ("All 4 sides equal \u2014 shape?",
   "Which shape has all 4 sides the same length?",
   ""),

  ("Shape with 8 sides?",
   "What is the name of a shape that has 8 sides?",
   poly_svg(8)),

  ("Triangle has how many corners?",
   "How many corners does a triangle have?",
   poly_svg(3)),

  ("Square vs rectangle: difference?",
   "What is the difference between a square and a rectangle?",
   ""),

  ("Shape: 6 sides, 6 corners?",
   "What shape has exactly 6 sides and 6 corners?",
   poly_svg(6)),

  ("5 sides, 5 corners?",
   "Which shape has 5 sides and 5 corners?",
   poly_svg(5)),

  ("Hexagon corners?",
   "How many corners does a hexagon have?",
   poly_svg(6)),

  ("Which is a polygon (straight sides only)?",
   "Which of the following shapes is a polygon? Polygons have only straight sides.",
   ""),

  ("Octagon sides?",
   "How many sides does an octagon have?",
   poly_svg(8)),

  ("Sides of square + sides of triangle = ?",
   "A square has 4 sides and a triangle has 3 sides. How many sides do they have altogether?",
   ""),

  ("Name for a 3-sided polygon?",
   "What is the name for a polygon that has exactly 3 sides?",
   ""),

  ("Corners of pentagon + corners of hexagon = ?",
   "A pentagon has 5 corners and a hexagon has 6 corners. How many corners do they have altogether?",
   ""),

  ("Square is a special type of?",
   "A square is a special type of which shape?",
   ""),

  ("Which shape has 4 sides but NOT all equal?",
   "Which shape has 4 sides but the sides are not all the same length?",
   ""),

  ("Sides of hexagon + pentagon = ?",
   "A hexagon has 6 sides and a pentagon has 5 sides. How many sides do they have altogether?",
   ""),

  ("A polygon always has?",
   "A polygon always has which of the following features?",
   ""),

  ("Name a quadrilateral with only 1 pair of parallel sides?",
   "Which quadrilateral has exactly one pair of parallel sides?",
   ""),

  ("Which shape has 0 sides?",
   "Which shape has no sides and no corners at all?",
   ""),

  ("Shape with 4 sides where all angles are equal?",
   "Which shape has 4 sides and all 4 angles are equal right angles?",
   ""),

  # ── L2: Solid Shapes ─────────────────────────────────────────────────────

  ("Cube faces?",
   "How many faces does a cube have?",
   cube_svg()),

  ("Soup can shape?",
   "A soup can is shaped like which 3D shape?",
   cylinder_svg()),

  ("Ice cream cone shape?",
   "An ice cream cone is shaped like which 3D shape?",
   cone_svg()),

  ("Sphere edges?",
   "How many edges does a sphere have?",
   sphere_svg()),

  ("Cube vertices?",
   "How many vertices does a cube have?",
   cube_svg()),

  ("Cereal box shape?",
   "A cereal box is shaped like which 3D shape?",
   ""),

  ("Cube edges?",
   "How many edges does a cube have?",
   cube_svg()),

  ("Basketball shape?",
   "A basketball is shaped like which 3D shape?",
   sphere_svg()),

  ("Pyramid faces?",
   "How many faces does a square pyramid have?",
   pyramid_svg()),

  ("Cone vertices?",
   "How many vertices does a cone have?",
   cone_svg()),

  ("Cylinder faces?",
   "How many faces does a cylinder have?",
   cylinder_svg()),

  ("Dice shape?",
   "A dice is shaped like which 3D shape?",
   cube_svg()),

  ("Which has 0 vertices?",
   "Which 3D shape has zero vertices?",
   ""),

  ("Rectangular prism faces?",
   "How many faces does a rectangular prism have?",
   ""),

  ("Which 3D shape has 1 curved face?",
   "Which 3D shape has only one curved surface and no flat faces?",
   sphere_svg()),

  ("Pyramid vertices?",
   "How many vertices does a square pyramid have?",
   pyramid_svg()),

  ("Can (cylinder) edges?",
   "How many edges does a cylinder have?",
   cylinder_svg()),

  ("Which has more faces: cube or pyramid?",
   "Which shape has more faces: a cube or a square pyramid?",
   ""),

  ("Tent shape?",
   "A camping tent is shaped most like which 3D shape?",
   ""),

  ("3D shapes are also called?",
   "What are 3D shapes also called?",
   ""),

  ("Face of a cube is shaped like?",
   "Each face of a cube is shaped like which flat shape?",
   cube_svg()),

  ("Cube: faces + vertices = ?",
   "A cube has 6 faces and 8 vertices. What is the total of faces plus vertices?",
   ""),

  ("Cone has how many edges?",
   "How many edges does a cone have?",
   cone_svg()),

  ("Football shape most like?",
   "A football is shaped most like which 3D shape?",
   ""),

  ("Pyramid edges?",
   "How many edges does a square pyramid have?",
   pyramid_svg()),

  ("Which shape rolls easily?",
   "Which 3D shape can roll most easily in any direction?",
   ""),

  ("Cube faces + edges = ?",
   "A cube has 6 faces and 12 edges. What is the total of faces plus edges?",
   ""),

  ("Oatmeal canister shape?",
   "An oatmeal canister is shaped like which 3D shape?",
   cylinder_svg()),

  # ── L3: Lines of Symmetry ─────────────────────────────────────────────────

  ("Square lines of symmetry?",
   "How many lines of symmetry does a square have?",
   square_sym_svg()),

  ("Circle lines of symmetry?",
   "How many lines of symmetry does a circle have?",
   ""),

  ("Letter Z has symmetry?",
   "Does the letter Z have a line of symmetry?",
   ""),

  ("Letter A has symmetry?",
   "Does the letter A have a line of symmetry?",
   ""),

  ("Rectangle lines of symmetry?",
   "How many lines of symmetry does a rectangle have?",
   rect_sym_svg()),

  ("Symmetry means?",
   "What does the word symmetry mean?",
   ""),

  ("Equilateral triangle lines of symmetry?",
   "How many lines of symmetry does an equilateral triangle have?",
   tri_sym_svg()),

  ("Letter B has symmetry?",
   "Does the letter B have a line of symmetry?",
   ""),

  ("Letter H lines of symmetry?",
   "How many lines of symmetry does the letter H have?",
   ""),

  ("Star (5-pointed) lines of symmetry?",
   "How many lines of symmetry does a 5-pointed star have?",
   ""),

  ("Regular hexagon lines of symmetry?",
   "How many lines of symmetry does a regular hexagon have?",
   poly_svg(6, fill='#fde8d8', stroke='#e67e22')),

  ("A line of symmetry divides a shape into?",
   "A line of symmetry divides a shape into two parts that are?",
   ""),

  ("Letter O lines of symmetry?",
   "How many lines of symmetry does the letter O have?",
   ""),

  ("Letter M has symmetry?",
   "Does the letter M have a line of symmetry?",
   ""),

  ("Square vs rectangle: more lines of symmetry?",
   "Which shape has more lines of symmetry: a square or a rectangle?",
   ""),

  ("Letter S has symmetry?",
   "Does the letter S have a line of symmetry?",
   ""),

  ("If you fold along line of symmetry, halves?",
   "If you fold a shape along its line of symmetry, what happens to the two halves?",
   ""),

  ("Letter X lines of symmetry?",
   "How many lines of symmetry does the letter X have?",
   ""),

  ("Regular pentagon lines of symmetry?",
   "How many lines of symmetry does a regular pentagon have?",
   poly_svg(5, fill='#fde8d8', stroke='#e67e22')),

  ("Rhombus lines of symmetry?",
   "How many lines of symmetry does a rhombus have?",
   ""),

  ("Right triangle lines of symmetry?",
   "How many lines of symmetry does a right triangle have?",
   ""),

  ("Arrow pointing right: lines of symmetry?",
   "How many lines of symmetry does an arrow pointing to the right have?",
   ""),

  ("Heart shape: lines of symmetry?",
   "How many lines of symmetry does a heart shape have?",
   ""),

  # ── unitQuiz unique fragments (text that differs from qBank) ─────────────

  ("Hexagon sides?",
   "How many sides does a hexagon have?",
   poly_svg(6)),

  ("4 equal sides?",
   "Which shape has all 4 sides the same length?",
   ""),

  ("Rectangle has symmetry?",
   "How many lines of symmetry does a rectangle have?",
   rect_sym_svg()),

  ("Ball shape?",
   "A ball is shaped like which 3D shape?",
   sphere_svg()),

  ("3 sides, 3 corners?",
   "A shape with 3 sides and 3 corners is called a?",
   poly_svg(3)),

  ("3D shape with 0 edges?",
   "Which 3D shape has zero edges?",
   ""),

  ("Rectangle sides?",
   "How many sides does a rectangle have?",
   ""),

  ("Rhombus sides?",
   "How many sides does a rhombus have?",
   ""),

  ("5 sides and 5 corners?",
   "Which shape has 5 sides and 5 corners?",
   poly_svg(5)),

  ("Cylinder edges?",
   "How many edges does a cylinder have?",
   cylinder_svg()),

  ("Vertical symmetry: A B C D?",
   "Which of these letters has a vertical line of symmetry?",
   ""),

  ("3D shape?",
   "Which of the following is a 3D shape?",
   ""),

  ("Flat shape called?",
   "What is a flat, 2-dimensional shape called?",
   ""),

  ("Sphere faces?",
   "How many curved faces does a sphere have?",
   sphere_svg()),

]

# ── Apply all rewrites ────────────────────────────────────────────────────────

with open('E:/Cameron Jones/my-math-roots/index.html', 'rb') as f:
    content = f.read()

hits = 0
misses = []
for old, new, svg in REWRITES:
    old_b = ("q('" + old + "',").encode('utf-8')
    new_b = ("q('" + new + svg + "',").encode('utf-8')
    if old_b in content:
        count = content.count(old_b)
        content = content.replace(old_b, new_b)
        hits += 1
        print(f"  OK ({count}x): {old[:50]}")
    else:
        misses.append(old)
        print(f"  MISS: {old[:60]}")

print(f"\n{hits}/{len(REWRITES)} rewrites applied. {len(misses)} missed.")
if misses:
    print("Missed:")
    for m in misses: print("  -", m)

with open('E:/Cameron Jones/my-math-roots/index.html', 'wb') as f:
    f.write(content)
print("Saved.")
