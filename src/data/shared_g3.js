// ════════════════════════════════════════
//  shared_g3.js — Grade 3 Grade Data
//
//  Mirrors the shared_g1.js / shared_k.js pattern:
//    1. _UNITS_DATA_G3        — 10 unit shells (97 lesson shells; content
//                               filled lazily by data/g3/u*.js)
//    2. _mergeG3UnitData()    — called by dist/data/g3/u*.js at parse time
//    3. _loadG3Unit()         — lazy-loads /data/g3/u{n}.js on demand
//    4. _applyGrade3Grade()   — splices UNITS_DATA and rebinds _loadUnit
//
//  IMPORTANT — schema choice: Grade 3 unit files author the LEGACY compact
//  shape (points / examples / practice / qBank), exactly like Grade 2 and the
//  K units — NOT the Grade 1 v0.2.0 spec (keyIdeas / workedExamples /
//  practiceQuestions / quizBank). So _mergeG3UnitData merges lesson fields
//  directly (Object.assign onto the shell) and does NOT run the G1 field
//  adapters. Only the unit-test assembly tail (sourceRule:'all_lesson_quizbanks')
//  is borrowed from the Grade 1 helpers so the unit testBank is sampled from
//  the combined lesson qBanks rather than a separate hand-maintained bank.
//
//  Lesson shells carry id/title/icon/desc/teks + diagnostic metadata
//  (defaultTags drive topic detection in key-ideas.js / quiz.js; defaultInter-
//  vention.retry.matchTags name the err_ families each lesson can diagnose).
//  The per-lesson CONTENT (points/examples/practice/qBank) merges in from
//  data/g3/u{n}.js. Lesson ids follow the canonical 'g3-u<n>-l<m>' form.
// ════════════════════════════════════════

// ── Unit 1 — Place Value to 100,000 ──────────────────────────────────────────
const _G3_U1_LESSONS = [
  { id:'g3-u1-l1', title:'Understand Numbers to 100,000', icon:'🔢', desc:'Read and write whole numbers through 100,000 using place value', teks:'TEKS 3.2A', defaultTags:['skill_place_value','topic_place_value'], defaultIntervention:{ teach:'place-value', retry:{ matchTags:['err_place_value_digit_confusion'] } } },
  { id:'g3-u1-l2', title:'Ten Thousands to Ones', icon:'🏷️', desc:'Name the value of each digit from ten-thousands to ones', teks:'TEKS 3.2A', defaultTags:['skill_place_value','topic_place_value'], defaultIntervention:{ teach:'place-value', retry:{ matchTags:['err_place_value_digit_confusion'] } } },
  { id:'g3-u1-l3', title:'Compose From Place-Value Parts', icon:'🧱', desc:'Build a number from its ten-thousands, thousands, hundreds, tens, and ones', teks:'TEKS 3.2A', defaultTags:['skill_compose_numbers','topic_place_value'], defaultIntervention:{ teach:'place-value', retry:{ matchTags:['err_place_value_digit_confusion','err_expanded_form_missing_zero'] } } },
  { id:'g3-u1-l4', title:'Decompose Into Expanded Form', icon:'➕', desc:'Write a number in expanded notation (40,000 + 300 + 20 + 5)', teks:'TEKS 3.2A', defaultTags:['skill_expanded_form','topic_place_value'], defaultIntervention:{ teach:'place-value', retry:{ matchTags:['err_expanded_form_missing_zero'] } } },
  { id:'g3-u1-l5', title:'Base-10 Relationships', icon:'🔁', desc:'Each place is 10 times the place to its right', teks:'TEKS 3.2A', defaultTags:['skill_base_ten','topic_place_value'], defaultIntervention:{ teach:'place-value', retry:{ matchTags:['err_place_value_digit_confusion'] } } },
  { id:'g3-u1-l6', title:'Benchmark Number Lines', icon:'📈', desc:'Locate whole numbers on a number line using benchmarks', teks:'TEKS 3.2C', defaultTags:['skill_number_line','topic_place_value'], defaultIntervention:{ teach:'place-value', retry:{ matchTags:['err_compare_by_length_only'] } } },
  { id:'g3-u1-l7', title:'Round Whole Numbers', icon:'🎯', desc:'Round to the nearest ten and hundred using a number line', teks:'TEKS 3.4B', defaultTags:['skill_rounding','topic_rounding'], defaultIntervention:{ teach:'rounding', retry:{ matchTags:['err_rounding_wrong_benchmark'] } } },
  { id:'g3-u1-l8', title:'Compare and Order Numbers', icon:'⚖️', desc:'Compare and order numbers to 100,000 using <, >, and =', teks:'TEKS 3.2D', defaultTags:['skill_compare_numbers','topic_compare'], defaultIntervention:{ teach:'compare', retry:{ matchTags:['err_compare_by_length_only'] } } }
];

// ── Unit 2 — Addition, Subtraction, and Money ────────────────────────────────
const _G3_U2_LESSONS = [
  { id:'g3-u2-l1', title:'Add Within 1,000', icon:'➕', desc:'Add within 1,000 using place value and regrouping', teks:'TEKS 3.4A', defaultTags:['skill_addition','topic_addition'], defaultIntervention:{ teach:'addition', retry:{ matchTags:['err_regrouping_error'] } } },
  { id:'g3-u2-l2', title:'Subtract With Regrouping', icon:'➖', desc:'Subtract within 1,000 using regrouping', teks:'TEKS 3.4A', defaultTags:['skill_subtraction','topic_subtraction'], defaultIntervention:{ teach:'subtraction', retry:{ matchTags:['err_regrouping_error'] } } },
  { id:'g3-u2-l3', title:'Addition/Subtraction Relationships', icon:'🔗', desc:'Use the inverse relationship to check answers', teks:'TEKS 3.5A', defaultTags:['skill_fact_family','topic_addition'], defaultIntervention:{ teach:'addition', retry:{ matchTags:['err_operation_choice_error'] } } },
  { id:'g3-u2-l4', title:'Estimate Sums and Differences', icon:'≈', desc:'Round to estimate sums and differences', teks:'TEKS 3.4B', defaultTags:['skill_estimation','topic_rounding'], defaultIntervention:{ teach:'rounding', retry:{ matchTags:['err_estimate_exact_confusion'] } } },
  { id:'g3-u2-l5', title:'Compatible Numbers', icon:'🤝', desc:'Use friendly numbers to estimate', teks:'TEKS 3.4B', defaultTags:['skill_estimation','topic_rounding'], defaultIntervention:{ teach:'rounding', retry:{ matchTags:['err_estimate_exact_confusion'] } } },
  { id:'g3-u2-l6', title:'One-Step Word Problems', icon:'📖', desc:'Solve one-step addition and subtraction word problems', teks:'TEKS 3.5A', defaultTags:['skill_word_problems','topic_addition'], defaultIntervention:{ teach:'addition', retry:{ matchTags:['err_operation_choice_error'] } } },
  { id:'g3-u2-l7', title:'Two-Step Word Problems', icon:'📚', desc:'Solve two-step addition and subtraction word problems', teks:'TEKS 3.5A', defaultTags:['skill_word_problems','topic_addition'], defaultIntervention:{ teach:'addition', retry:{ matchTags:['err_operation_choice_error'] } } },
  { id:'g3-u2-l8', title:'Count Coins and Bills', icon:'💵', desc:'Find the value of a collection of coins and bills', teks:'TEKS 3.4C', defaultTags:['skill_money','topic_money'], defaultIntervention:{ teach:'money', retry:{ matchTags:['err_money_coin_value_confusion'] } } }
];

// ── Unit 3 — Multiplication Foundations ──────────────────────────────────────
const _G3_U3_LESSONS = [
  { id:'g3-u3-l1', title:'Equal Groups', icon:'🍎', desc:'Make and count equal groups', teks:'TEKS 3.4D', defaultTags:['skill_equal_groups','topic_multiplication'], defaultIntervention:{ teach:'multiplication', retry:{ matchTags:['err_groups_vs_total_confusion'] } } },
  { id:'g3-u3-l2', title:'Repeated Addition', icon:'➕', desc:'Connect repeated addition to multiplication', teks:'TEKS 3.4E', defaultTags:['skill_repeated_addition','topic_multiplication'], defaultIntervention:{ teach:'multiplication', retry:{ matchTags:['err_groups_vs_total_confusion'] } } },
  { id:'g3-u3-l3', title:'Arrays', icon:'🔲', desc:'Use rows and columns to model multiplication', teks:'TEKS 3.4D', defaultTags:['skill_arrays','topic_multiplication'], defaultIntervention:{ teach:'multiplication', retry:{ matchTags:['err_array_row_column_confusion'] } } },
  { id:'g3-u3-l4', title:'Skip Counting', icon:'⏭️', desc:'Skip count to find totals of equal groups', teks:'TEKS 3.4F', defaultTags:['skill_skip_count','topic_multiplication'], defaultIntervention:{ teach:'multiplication', retry:{ matchTags:['err_skip_count_sequence_error'] } } },
  { id:'g3-u3-l5', title:'Equal Jumps on a Number Line', icon:'📈', desc:'Show multiplication as equal jumps', teks:'TEKS 3.4K', defaultTags:['skill_number_line_mult','topic_multiplication'], defaultIntervention:{ teach:'multiplication', retry:{ matchTags:['err_skip_count_sequence_error'] } } },
  { id:'g3-u3-l6', title:'Area Models', icon:'🟦', desc:'Use area models to multiply', teks:'TEKS 3.4D', defaultTags:['skill_area_model','topic_multiplication'], defaultIntervention:{ teach:'multiplication', retry:{ matchTags:['err_array_row_column_confusion'] } } },
  { id:'g3-u3-l7', title:'Facts: 0, 1, 2, 5, 10', icon:'✋', desc:'Multiplication facts for 0, 1, 2, 5, and 10', teks:'TEKS 3.4F', defaultTags:['skill_mult_facts','topic_multiplication'], defaultIntervention:{ teach:'multiplication', retry:{ matchTags:['err_skip_count_sequence_error'] } } },
  { id:'g3-u3-l8', title:'Facts: 3, 4, 6', icon:'🎲', desc:'Multiplication facts for 3, 4, and 6', teks:'TEKS 3.4F', defaultTags:['skill_mult_facts','topic_multiplication'], defaultIntervention:{ teach:'multiplication', retry:{ matchTags:['err_groups_vs_total_confusion'] } } },
  { id:'g3-u3-l9', title:'Facts: 7, 8, 9', icon:'🧮', desc:'Multiplication facts for 7, 8, and 9', teks:'TEKS 3.4F', defaultTags:['skill_mult_facts','topic_multiplication'], defaultIntervention:{ teach:'multiplication', retry:{ matchTags:['err_groups_vs_total_confusion'] } } },
  { id:'g3-u3-l10', title:'Multiplication as Comparison', icon:'🔭', desc:'Interpret products as "n times as many"', teks:'TEKS 3.5C', defaultTags:['skill_mult_comparison','topic_multiplication'], defaultIntervention:{ teach:'multiplication', retry:{ matchTags:['err_multiplication_comparison_error'] } } }
];

// ── Unit 4 — Division Foundations ────────────────────────────────────────────
const _G3_U4_LESSONS = [
  { id:'g3-u4-l1', title:'Equal Sharing', icon:'🤲', desc:'Share a total equally among groups', teks:'TEKS 3.4H', defaultTags:['skill_equal_sharing','topic_division'], defaultIntervention:{ teach:'division', retry:{ matchTags:['err_sharing_grouping_confusion'] } } },
  { id:'g3-u4-l2', title:'Equal Groups Division', icon:'🍪', desc:'Divide a total into equal groups', teks:'TEKS 3.4H', defaultTags:['skill_division','topic_division'], defaultIntervention:{ teach:'division', retry:{ matchTags:['err_sharing_grouping_confusion'] } } },
  { id:'g3-u4-l3', title:'Division With Arrays', icon:'🔲', desc:'Use arrays to model division', teks:'TEKS 3.4K', defaultTags:['skill_division_array','topic_division'], defaultIntervention:{ teach:'division', retry:{ matchTags:['err_quotient_total_confusion'] } } },
  { id:'g3-u4-l4', title:'Division as the Opposite of Multiplication', icon:'🔄', desc:'Relate division to multiplication', teks:'TEKS 3.4J', defaultTags:['skill_inverse_operations','topic_division'], defaultIntervention:{ teach:'division', retry:{ matchTags:['err_division_as_subtraction_only'] } } },
  { id:'g3-u4-l5', title:'Fact Families', icon:'👨‍👩‍👧', desc:'Build multiplication/division fact families', teks:'TEKS 3.4J', defaultTags:['skill_fact_family','topic_division'], defaultIntervention:{ teach:'division', retry:{ matchTags:['err_missing_factor_error'] } } },
  { id:'g3-u4-l6', title:'Quotients Using Multiplication', icon:'🧩', desc:'Find quotients by thinking about multiplication', teks:'TEKS 3.4J', defaultTags:['skill_division','topic_division'], defaultIntervention:{ teach:'division', retry:{ matchTags:['err_quotient_total_confusion'] } } },
  { id:'g3-u4-l7', title:'Missing Factors', icon:'❓', desc:'Find the missing factor in a multiplication sentence', teks:'TEKS 3.5D', defaultTags:['skill_missing_factor','topic_division'], defaultIntervention:{ teach:'division', retry:{ matchTags:['err_missing_factor_error'] } } },
  { id:'g3-u4-l8', title:'Missing Products and Quotients', icon:'🔍', desc:'Find missing products and quotients', teks:'TEKS 3.5D', defaultTags:['skill_missing_factor','topic_division'], defaultIntervention:{ teach:'division', retry:{ matchTags:['err_quotient_total_confusion'] } } }
];

// ── Unit 5 — Multiplication and Division Problem Solving ──────────────────────
const _G3_U5_LESSONS = [
  { id:'g3-u5-l1', title:'One-Step Multiplication', icon:'✖️', desc:'Solve one-step multiplication problems', teks:'TEKS 3.4K', defaultTags:['skill_word_problems','topic_multiplication'], defaultIntervention:{ teach:'multiplication', retry:{ matchTags:['err_wrong_operation_selected'] } } },
  { id:'g3-u5-l2', title:'One-Step Division', icon:'➗', desc:'Solve one-step division problems', teks:'TEKS 3.4K', defaultTags:['skill_word_problems','topic_division'], defaultIntervention:{ teach:'division', retry:{ matchTags:['err_wrong_operation_selected'] } } },
  { id:'g3-u5-l3', title:'Choose Multiplication or Division', icon:'🔀', desc:'Decide which operation a problem needs', teks:'TEKS 3.5B', defaultTags:['skill_operation_choice','topic_multiplication'], defaultIntervention:{ teach:'multiplication', retry:{ matchTags:['err_wrong_operation_selected'] } } },
  { id:'g3-u5-l4', title:'Strip Diagrams', icon:'📊', desc:'Model problems with strip diagrams', teks:'TEKS 3.5B', defaultTags:['skill_strip_diagram','topic_multiplication'], defaultIntervention:{ teach:'multiplication', retry:{ matchTags:['err_wrong_operation_selected'] } } },
  { id:'g3-u5-l5', title:'Write Equations', icon:'✏️', desc:'Write equations with an unknown for problems', teks:'TEKS 3.5E', defaultTags:['skill_equations','topic_multiplication'], defaultIntervention:{ teach:'multiplication', retry:{ matchTags:['err_wrong_operation_selected'] } } },
  { id:'g3-u5-l6', title:'Two-Step Mult/Div Problems', icon:'2️⃣', desc:'Solve two-step multiplication and division problems', teks:'TEKS 3.5E', defaultTags:['skill_two_step','topic_multiplication'], defaultIntervention:{ teach:'multiplication', retry:{ matchTags:['err_two_step_only_did_one_step'] } } },
  { id:'g3-u5-l7', title:'Mixed Two-Step Problems', icon:'🔢', desc:'Solve two-step problems mixing operations', teks:'TEKS 3.5E', defaultTags:['skill_two_step','topic_multiplication'], defaultIntervention:{ teach:'multiplication', retry:{ matchTags:['err_two_step_only_did_one_step'] } } },
  { id:'g3-u5-l8', title:'2-Digit × 1-Digit: Area Models', icon:'🟦', desc:'Multiply 2-digit by 1-digit with area models', teks:'TEKS 3.4G', defaultTags:['skill_area_model','topic_multiplication'], defaultIntervention:{ teach:'multiplication', retry:{ matchTags:['err_partial_product_place_value_error'] } } },
  { id:'g3-u5-l9', title:'2-Digit × 1-Digit: Partial Products', icon:'🧮', desc:'Multiply using partial products', teks:'TEKS 3.4G', defaultTags:['skill_partial_products','topic_multiplication'], defaultIntervention:{ teach:'multiplication', retry:{ matchTags:['err_partial_product_place_value_error'] } } },
  { id:'g3-u5-l10', title:'2-Digit × 1-Digit: Standard Algorithm', icon:'📐', desc:'Multiply using the standard algorithm', teks:'TEKS 3.4G', defaultTags:['skill_standard_algorithm','topic_multiplication'], defaultIntervention:{ teach:'multiplication', retry:{ matchTags:['err_standard_algorithm_carry_error'] } } },
  { id:'g3-u5-l11', title:'Even and Odd Numbers', icon:'🔁', desc:'Identify even and odd numbers and why', teks:'TEKS 3.4I', defaultTags:['skill_even_odd','topic_multiplication'], defaultIntervention:{ teach:'multiplication', retry:{ matchTags:['err_even_odd_rule_error'] } } }
];

// ── Unit 6 — Fractions as Numbers ────────────────────────────────────────────
const _G3_U6_LESSONS = [
  { id:'g3-u6-l1', title:'Equal Parts of a Whole', icon:'🍕', desc:'Partition a whole into equal parts', teks:'TEKS 3.3A', defaultTags:['skill_equal_parts','topic_fraction'], defaultIntervention:{ teach:'fraction', retry:{ matchTags:['err_unequal_parts_error'] } } },
  { id:'g3-u6-l2', title:'Unit Fractions', icon:'1️⃣', desc:'Understand 1/b as one part of b equal parts', teks:'TEKS 3.3A', defaultTags:['skill_unit_fraction','topic_fraction'], defaultIntervention:{ teach:'fraction', retry:{ matchTags:['err_unit_fraction_confusion'] } } },
  { id:'g3-u6-l3', title:'Denominators 2, 3, 4, 6, 8', icon:'🔢', desc:'Name fractions with denominators 2, 3, 4, 6, and 8', teks:'TEKS 3.3A', defaultTags:['skill_fractions','topic_fraction'], defaultIntervention:{ teach:'fraction', retry:{ matchTags:['err_numerator_denominator_reversal'] } } },
  { id:'g3-u6-l4', title:'Fractions With Strip Diagrams', icon:'📊', desc:'Represent fractions with strip diagrams', teks:'TEKS 3.3B', defaultTags:['skill_fraction_strip','topic_fraction'], defaultIntervention:{ teach:'fraction', retry:{ matchTags:['err_unequal_parts_error'] } } },
  { id:'g3-u6-l5', title:'Fractions With Area Models', icon:'🟧', desc:'Represent fractions with area models', teks:'TEKS 3.3B', defaultTags:['skill_fraction_area','topic_fraction'], defaultIntervention:{ teach:'fraction', retry:{ matchTags:['err_unequal_parts_error'] } } },
  { id:'g3-u6-l6', title:'Fractions on a Number Line', icon:'📈', desc:'Place fractions on a number line', teks:'TEKS 3.3B', defaultTags:['skill_fraction_number_line','topic_fraction'], defaultIntervention:{ teach:'fraction', retry:{ matchTags:['err_number_line_partition_error'] } } },
  { id:'g3-u6-l7', title:'Identify a Fraction From a Point', icon:'📍', desc:'Name the fraction shown at a point on a number line', teks:'TEKS 3.3C', defaultTags:['skill_fraction_number_line','topic_fraction'], defaultIntervention:{ teach:'fraction', retry:{ matchTags:['err_number_line_partition_error'] } } },
  { id:'g3-u6-l8', title:'Fractions of a Set', icon:'🟢', desc:'Find a fraction of a set of objects', teks:'TEKS 3.3E', defaultTags:['skill_fraction_set','topic_fraction'], defaultIntervention:{ teach:'fraction', retry:{ matchTags:['err_fraction_of_set_error'] } } },
  { id:'g3-u6-l9', title:'Compose From Unit Fractions', icon:'🧩', desc:'Build a fraction from unit fractions', teks:'TEKS 3.3D', defaultTags:['skill_compose_fraction','topic_fraction'], defaultIntervention:{ teach:'fraction', retry:{ matchTags:['err_unit_fraction_confusion'] } } },
  { id:'g3-u6-l10', title:'Decompose Into Unit Fractions', icon:'✂️', desc:'Break a fraction into unit fractions', teks:'TEKS 3.3D', defaultTags:['skill_decompose_fraction','topic_fraction'], defaultIntervention:{ teach:'fraction', retry:{ matchTags:['err_unit_fraction_confusion'] } } }
];

// ── Unit 7 — Equivalent and Comparing Fractions ──────────────────────────────
const _G3_U7_LESSONS = [
  { id:'g3-u7-l1', title:'Equivalent: Area Models', icon:'🟧', desc:'Find equivalent fractions with area models', teks:'TEKS 3.3F', defaultTags:['skill_equivalent_fraction','topic_fraction'], defaultIntervention:{ teach:'fraction', retry:{ matchTags:['err_equivalent_fraction_visual_mismatch'] } } },
  { id:'g3-u7-l2', title:'Equivalent: Strip Diagrams', icon:'📊', desc:'Find equivalent fractions with strip diagrams', teks:'TEKS 3.3F', defaultTags:['skill_equivalent_fraction','topic_fraction'], defaultIntervention:{ teach:'fraction', retry:{ matchTags:['err_equivalent_fraction_visual_mismatch'] } } },
  { id:'g3-u7-l3', title:'Equivalent: Number Lines', icon:'📈', desc:'Find equivalent fractions on number lines', teks:'TEKS 3.3F', defaultTags:['skill_equivalent_fraction','topic_fraction'], defaultIntervention:{ teach:'fraction', retry:{ matchTags:['err_number_line_partition_error'] } } },
  { id:'g3-u7-l4', title:'Same Point, Same Value', icon:'📍', desc:'Fractions at the same point are equal', teks:'TEKS 3.3G', defaultTags:['skill_equivalent_fraction','topic_fraction'], defaultIntervention:{ teach:'fraction', retry:{ matchTags:['err_equivalent_fraction_visual_mismatch'] } } },
  { id:'g3-u7-l5', title:'Compare: Same Denominator', icon:'⚖️', desc:'Compare fractions with the same denominator', teks:'TEKS 3.3H', defaultTags:['skill_compare_fraction','topic_fraction'], defaultIntervention:{ teach:'fraction', retry:{ matchTags:['err_same_denominator_confusion'] } } },
  { id:'g3-u7-l6', title:'Compare: Same Numerator', icon:'⚖️', desc:'Compare fractions with the same numerator', teks:'TEKS 3.3H', defaultTags:['skill_compare_fraction','topic_fraction'], defaultIntervention:{ teach:'fraction', retry:{ matchTags:['err_same_numerator_confusion','err_larger_denominator_larger_fraction'] } } },
  { id:'g3-u7-l7', title:'Use >, <, and = With Fractions', icon:'🔣', desc:'Compare fractions using <, >, and =', teks:'TEKS 3.3H', defaultTags:['skill_compare_fraction','topic_compare'], defaultIntervention:{ teach:'compare', retry:{ matchTags:['err_larger_denominator_larger_fraction'] } } },
  { id:'g3-u7-l8', title:'Equal Shares, Different Shapes', icon:'🔷', desc:'Equal shares need not be the same shape', teks:'TEKS 3.6E', defaultTags:['skill_equal_shares','topic_fraction'], defaultIntervention:{ teach:'fraction', retry:{ matchTags:['err_same_whole_requirement_error'] } } }
];

// ── Unit 8 — Geometry, Area, and Perimeter ───────────────────────────────────
const _G3_U8_LESSONS = [
  { id:'g3-u8-l1', title:'Classify 2D Figures', icon:'🔷', desc:'Classify two-dimensional figures by attributes', teks:'TEKS 3.6A', defaultTags:['skill_classify_2d','topic_shapes'], defaultIntervention:{ teach:'shapes', retry:{ matchTags:['err_shape_attribute_error'] } } },
  { id:'g3-u8-l2', title:'Classify 3D Figures', icon:'📦', desc:'Classify three-dimensional solids by attributes', teks:'TEKS 3.6A', defaultTags:['skill_classify_3d','topic_shapes'], defaultIntervention:{ teach:'shapes', retry:{ matchTags:['err_shape_attribute_error'] } } },
  { id:'g3-u8-l3', title:'Attributes of Shapes', icon:'📐', desc:'Describe shapes by sides, vertices, and angles', teks:'TEKS 3.6A', defaultTags:['skill_shape_attributes','topic_shapes'], defaultIntervention:{ teach:'shapes', retry:{ matchTags:['err_shape_attribute_error'] } } },
  { id:'g3-u8-l4', title:'Quadrilaterals', icon:'🟪', desc:'Identify four-sided figures', teks:'TEKS 3.6A', defaultTags:['skill_quadrilaterals','topic_shapes'], defaultIntervention:{ teach:'shapes', retry:{ matchTags:['err_quadrilateral_category_error'] } } },
  { id:'g3-u8-l5', title:'Special Quadrilaterals', icon:'🔶', desc:'Rhombuses, rectangles, squares, parallelograms, trapezoids', teks:'TEKS 3.6A', defaultTags:['skill_quadrilaterals','topic_shapes'], defaultIntervention:{ teach:'shapes', retry:{ matchTags:['err_quadrilateral_category_error'] } } },
  { id:'g3-u8-l6', title:'Draw Other Quadrilaterals', icon:'✏️', desc:'Draw quadrilaterals that are not in special categories', teks:'TEKS 3.6A', defaultTags:['skill_quadrilaterals','topic_shapes'], defaultIntervention:{ teach:'shapes', retry:{ matchTags:['err_quadrilateral_category_error'] } } },
  { id:'g3-u8-l7', title:'Area With Unit Squares', icon:'🟦', desc:'Measure area by counting unit squares', teks:'TEKS 3.6C', defaultTags:['skill_area','topic_area'], defaultIntervention:{ teach:'area', retry:{ matchTags:['err_row_column_area_error'] } } },
  { id:'g3-u8-l8', title:'Area: Rows and Columns', icon:'▦', desc:'Find area using rows and columns of unit squares', teks:'TEKS 3.6C', defaultTags:['skill_area','topic_area'], defaultIntervention:{ teach:'area', retry:{ matchTags:['err_row_column_area_error'] } } },
  { id:'g3-u8-l9', title:'Area Using Multiplication', icon:'✖️', desc:'Find area by multiplying side lengths', teks:'TEKS 3.6C', defaultTags:['skill_area','topic_area'], defaultIntervention:{ teach:'area', retry:{ matchTags:['err_area_perimeter_confusion'] } } },
  { id:'g3-u8-l10', title:'Composite Area', icon:'🧩', desc:'Find the area of composite figures', teks:'TEKS 3.6D', defaultTags:['skill_composite_area','topic_area'], defaultIntervention:{ teach:'area', retry:{ matchTags:['err_composite_area_decomposition_error'] } } },
  { id:'g3-u8-l11', title:'Perimeter', icon:'📏', desc:'Find the perimeter of a figure', teks:'TEKS 3.7B', defaultTags:['skill_perimeter','topic_perimeter'], defaultIntervention:{ teach:'perimeter', retry:{ matchTags:['err_area_perimeter_confusion'] } } },
  { id:'g3-u8-l12', title:'Missing Side With Perimeter', icon:'❓', desc:'Find a missing side length given the perimeter', teks:'TEKS 3.7B', defaultTags:['skill_perimeter','topic_perimeter'], defaultIntervention:{ teach:'perimeter', retry:{ matchTags:['err_missing_side_perimeter_error'] } } }
];

// ── Unit 9 — Measurement, Time, and Data ─────────────────────────────────────
const _G3_U9_LESSONS = [
  { id:'g3-u9-l1', title:'Time Intervals in Minutes', icon:'⏱️', desc:'Tell and measure time to the minute', teks:'TEKS 3.7C', defaultTags:['skill_time','topic_time'], defaultIntervention:{ teach:'time', retry:{ matchTags:['err_clock_minute_hand_error'] } } },
  { id:'g3-u9-l2', title:'Add Time Intervals', icon:'➕', desc:'Add time intervals in minutes', teks:'TEKS 3.7C', defaultTags:['skill_elapsed_time','topic_time'], defaultIntervention:{ teach:'time', retry:{ matchTags:['err_elapsed_time_counting_error'] } } },
  { id:'g3-u9-l3', title:'Subtract Time Intervals', icon:'➖', desc:'Subtract time intervals in minutes', teks:'TEKS 3.7C', defaultTags:['skill_elapsed_time','topic_time'], defaultIntervention:{ teach:'time', retry:{ matchTags:['err_elapsed_time_counting_error'] } } },
  { id:'g3-u9-l4', title:'Elapsed Time on Clocks & Number Lines', icon:'🕐', desc:'Find elapsed time using clocks and number lines', teks:'TEKS 3.7C', defaultTags:['skill_elapsed_time','topic_time'], defaultIntervention:{ teach:'time', retry:{ matchTags:['err_elapsed_time_counting_error'] } } },
  { id:'g3-u9-l5', title:'Choose Volume or Weight', icon:'⚖️', desc:'Decide whether to measure liquid volume or weight', teks:'TEKS 3.7D', defaultTags:['skill_measurement_tool','topic_measurement'], defaultIntervention:{ teach:'measurement', retry:{ matchTags:['err_measurement_tool_choice_error'] } } },
  { id:'g3-u9-l6', title:'Measure Liquid Volume', icon:'🥤', desc:'Measure liquid volume in standard units', teks:'TEKS 3.7D', defaultTags:['skill_volume','topic_measurement'], defaultIntervention:{ teach:'measurement', retry:{ matchTags:['err_measurement_tool_choice_error'] } } },
  { id:'g3-u9-l7', title:'Measure Weight', icon:'🏋️', desc:'Measure weight in standard units', teks:'TEKS 3.7D', defaultTags:['skill_weight','topic_measurement'], defaultIntervention:{ teach:'measurement', retry:{ matchTags:['err_measurement_tool_choice_error'] } } },
  { id:'g3-u9-l8', title:'Frequency Tables', icon:'🗂️', desc:'Read and build frequency tables', teks:'TEKS 3.8A', defaultTags:['skill_frequency_table','topic_graphs'], defaultIntervention:{ teach:'graphs', retry:{ matchTags:['err_graph_scale_error'] } } },
  { id:'g3-u9-l9', title:'Dot Plots', icon:'⠿', desc:'Read and build dot plots', teks:'TEKS 3.8A', defaultTags:['skill_dot_plot','topic_graphs'], defaultIntervention:{ teach:'graphs', retry:{ matchTags:['err_graph_scale_error'] } } },
  { id:'g3-u9-l10', title:'Pictographs', icon:'🖼️', desc:'Read and build pictographs with a key', teks:'TEKS 3.8A', defaultTags:['skill_pictograph','topic_graphs'], defaultIntervention:{ teach:'graphs', retry:{ matchTags:['err_graph_scale_error'] } } },
  { id:'g3-u9-l11', title:'Scaled Bar Graphs', icon:'📊', desc:'Read and build bar graphs with scaled intervals', teks:'TEKS 3.8A', defaultTags:['skill_bar_graph','topic_graphs'], defaultIntervention:{ teach:'graphs', retry:{ matchTags:['err_graph_scale_error'] } } },
  { id:'g3-u9-l12', title:'One- and Two-Step Data Problems', icon:'🔎', desc:'Solve one- and two-step problems from graphs', teks:'TEKS 3.8B', defaultTags:['skill_data_problems','topic_graphs'], defaultIntervention:{ teach:'graphs', retry:{ matchTags:['err_data_two_step_error'] } } }
];

// ── Unit 10 — Personal Financial Literacy and CBE Final Review ────────────────
const _G3_U10_LESSONS = [
  { id:'g3-u10-l1', title:'Labor, Human Capital, and Income', icon:'💼', desc:'How labor and human capital relate to income', teks:'TEKS 3.9A', defaultTags:['skill_income','topic_financial'], defaultIntervention:{ teach:'financial', retry:{ matchTags:['err_income_labor_confusion'] } } },
  { id:'g3-u10-l2', title:'Scarcity and Cost', icon:'⛔', desc:'Scarcity means choosing because resources are limited', teks:'TEKS 3.9B', defaultTags:['skill_scarcity','topic_financial'], defaultIntervention:{ teach:'financial', retry:{ matchTags:['err_scarcity_cost_error'] } } },
  { id:'g3-u10-l3', title:'Planned Spending', icon:'🗓️', desc:'Plan spending with a budget', teks:'TEKS 3.9C', defaultTags:['skill_planned_spending','topic_financial'], defaultIntervention:{ teach:'financial', retry:{ matchTags:['err_planned_unplanned_spending_error'] } } },
  { id:'g3-u10-l4', title:'Unplanned Spending', icon:'⚠️', desc:'Recognize unplanned spending', teks:'TEKS 3.9C', defaultTags:['skill_unplanned_spending','topic_financial'], defaultIntervention:{ teach:'financial', retry:{ matchTags:['err_planned_unplanned_spending_error'] } } },
  { id:'g3-u10-l5', title:'Credit and Borrowing', icon:'💳', desc:'Borrowed money must be paid back', teks:'TEKS 3.9D', defaultTags:['skill_credit','topic_financial'], defaultIntervention:{ teach:'financial', retry:{ matchTags:['err_credit_free_money_error'] } } },
  { id:'g3-u10-l6', title:'Interest and Paying Back', icon:'📈', desc:'Borrowing can cost extra money called interest', teks:'TEKS 3.9D', defaultTags:['skill_credit','topic_financial'], defaultIntervention:{ teach:'financial', retry:{ matchTags:['err_credit_free_money_error'] } } },
  { id:'g3-u10-l7', title:'Reasons to Save', icon:'🐷', desc:'Why people save money', teks:'TEKS 3.9E', defaultTags:['skill_saving','topic_financial'], defaultIntervention:{ teach:'financial', retry:{ matchTags:['err_saving_goal_error'] } } },
  { id:'g3-u10-l8', title:'Savings Plans', icon:'🎯', desc:'Make a plan to reach a savings goal', teks:'TEKS 3.9E', defaultTags:['skill_saving','topic_financial'], defaultIntervention:{ teach:'financial', retry:{ matchTags:['err_saving_goal_error'] } } },
  { id:'g3-u10-l9', title:'Spending, Saving, Credit, Giving', icon:'❤️', desc:'Balance income, spending, saving, credit, and charitable giving', teks:'TEKS 3.9F', defaultTags:['skill_financial_plan','topic_financial'], defaultIntervention:{ teach:'financial', retry:{ matchTags:['err_charitable_giving_confusion'] } } },
  { id:'g3-u10-l10', title:'Final Grade 3 CBE Review', icon:'🎓', desc:'Cumulative review for the Grade 3 CBE-style final', teks:'TEKS 3.9F', defaultTags:['skill_review','topic_financial'], defaultIntervention:{ teach:'financial', retry:{ matchTags:['err_charitable_giving_confusion'] } } }
];

// ── Grade 3 unit shells ───────────────────────────────────────────────────────
//  Each unit clones its lesson-shell array (so per-grade merges never mutate the
//  shared shells). Lesson CONTENT (points/examples/practice/qBank) merges in
//  lazily from data/g3/u{n}.js via _mergeG3UnitData.
function _g3CloneLessons(arr){ return arr.map(function(l){ return Object.assign({}, l); }); }

const _UNITS_DATA_G3 = [
  { id:'g3u1',  name:'Place Value to 100,000',                          icon:'🔢', svg:'<svg viewBox="0 0 60 60" fill="none"><circle cx="30" cy="30" r="27" fill="#0095FF" opacity="0.1"/><rect x="3" y="20" width="54" height="30" rx="5" fill="#0095FF" opacity="0.15" stroke="#0095FF" stroke-width="2"/><line x1="21" y1="20" x2="21" y2="50" stroke="#0095FF" stroke-width="2"/><line x1="39" y1="20" x2="39" y2="50" stroke="#0095FF" stroke-width="2"/></svg>', color:'#0095FF', gp:1, teks:'TEKS 3.2A, 3.2B, 3.2C, 3.2D',                 lessons:_g3CloneLessons(_G3_U1_LESSONS),  _loaded:false },
  { id:'g3u2',  name:'Addition, Subtraction, and Money',                 icon:'➕', svg:'<svg viewBox="0 0 60 60" fill="none"><circle cx="30" cy="30" r="27" fill="#FF2200" opacity="0.1"/><rect x="8" y="27" width="18" height="7" rx="3.5" fill="#FF2200"/><rect x="13.5" y="21.5" width="7" height="18" rx="3.5" fill="#FF2200"/><rect x="34" y="27" width="18" height="7" rx="3.5" fill="#FF2200" opacity="0.75"/></svg>', color:'#FF2200', gp:1, teks:'TEKS 3.4A, 3.4B, 3.4C, 3.5A',                 lessons:_g3CloneLessons(_G3_U2_LESSONS),  _loaded:false },
  { id:'g3u3',  name:'Multiplication Foundations',                       icon:'✖️', svg:'<svg viewBox="0 0 60 60" fill="none"><circle cx="30" cy="30" r="27" fill="#9C27B0" opacity="0.1"/><circle cx="20" cy="20" r="4" fill="#9C27B0"/><circle cx="30" cy="20" r="4" fill="#9C27B0"/><circle cx="40" cy="20" r="4" fill="#9C27B0"/><circle cx="20" cy="32" r="4" fill="#9C27B0"/><circle cx="30" cy="32" r="4" fill="#9C27B0"/><circle cx="40" cy="32" r="4" fill="#9C27B0"/></svg>', color:'#9C27B0', gp:2, teks:'TEKS 3.4D, 3.4E, 3.4F, 3.5C',                 lessons:_g3CloneLessons(_G3_U3_LESSONS),  _loaded:false },
  { id:'g3u4',  name:'Division Foundations',                             icon:'➗', svg:'<svg viewBox="0 0 60 60" fill="none"><circle cx="30" cy="30" r="27" fill="#00897B" opacity="0.1"/><line x1="14" y1="30" x2="46" y2="30" stroke="#00897B" stroke-width="3" stroke-linecap="round"/><circle cx="30" cy="20" r="3.5" fill="#00897B"/><circle cx="30" cy="40" r="3.5" fill="#00897B"/></svg>', color:'#00897B', gp:2, teks:'TEKS 3.4F, 3.4H, 3.4J, 3.5B, 3.5D',           lessons:_g3CloneLessons(_G3_U4_LESSONS),  _loaded:false },
  { id:'g3u5',  name:'Multiplication and Division Problem Solving',      icon:'🧩', svg:'<svg viewBox="0 0 60 60" fill="none"><circle cx="30" cy="30" r="27" fill="#FF6F00" opacity="0.1"/><rect x="12" y="22" width="36" height="16" rx="3" fill="none" stroke="#FF6F00" stroke-width="2.5"/><line x1="24" y1="22" x2="24" y2="38" stroke="#FF6F00" stroke-width="2"/><line x1="36" y1="22" x2="36" y2="38" stroke="#FF6F00" stroke-width="2"/></svg>', color:'#FF6F00', gp:2, teks:'TEKS 3.4G, 3.4I, 3.4K, 3.5B, 3.5D, 3.5E', lessons:_g3CloneLessons(_G3_U5_LESSONS),  _loaded:false },
  { id:'g3u6',  name:'Fractions as Numbers',                             icon:'🍕', svg:'<svg viewBox="0 0 60 60" fill="none"><circle cx="30" cy="30" r="27" fill="#E91E63" opacity="0.1"/><circle cx="30" cy="30" r="18" fill="none" stroke="#E91E63" stroke-width="2.5"/><line x1="30" y1="12" x2="30" y2="48" stroke="#E91E63" stroke-width="2"/><line x1="14" y1="30" x2="46" y2="30" stroke="#E91E63" stroke-width="2"/></svg>', color:'#E91E63', gp:3, teks:'TEKS 3.3A, 3.3B, 3.3C, 3.3D, 3.3E, 3.7A', lessons:_g3CloneLessons(_G3_U6_LESSONS),  _loaded:false },
  { id:'g3u7',  name:'Equivalent and Comparing Fractions',              icon:'⚖️', svg:'<svg viewBox="0 0 60 60" fill="none"><circle cx="30" cy="30" r="27" fill="#3F51B5" opacity="0.1"/><line x1="30" y1="14" x2="30" y2="24" stroke="#3F51B5" stroke-width="2.5"/><line x1="12" y1="24" x2="48" y2="24" stroke="#3F51B5" stroke-width="2.5"/><circle cx="18" cy="38" r="7" fill="none" stroke="#3F51B5" stroke-width="2"/><circle cx="42" cy="38" r="7" fill="none" stroke="#3F51B5" stroke-width="2"/></svg>', color:'#3F51B5', gp:3, teks:'TEKS 3.3F, 3.3G, 3.3H, 3.6E',                 lessons:_g3CloneLessons(_G3_U7_LESSONS),  _loaded:false },
  { id:'g3u8',  name:'Geometry, Area, and Perimeter',                    icon:'🔷', svg:'<svg viewBox="0 0 60 60" fill="none"><circle cx="30" cy="30" r="27" fill="#43A047" opacity="0.1"/><rect x="14" y="18" width="32" height="24" rx="2" fill="none" stroke="#43A047" stroke-width="2.5"/><line x1="22" y1="18" x2="22" y2="42" stroke="#43A047" stroke-width="1.2"/><line x1="30" y1="18" x2="30" y2="42" stroke="#43A047" stroke-width="1.2"/><line x1="38" y1="18" x2="38" y2="42" stroke="#43A047" stroke-width="1.2"/></svg>', color:'#43A047', gp:3, teks:'TEKS 3.6A, 3.6B, 3.6C, 3.6D, 3.7B',           lessons:_g3CloneLessons(_G3_U8_LESSONS),  _loaded:false },
  { id:'g3u9',  name:'Measurement, Time, and Data',                      icon:'📏', svg:'<svg viewBox="0 0 60 60" fill="none"><circle cx="30" cy="30" r="27" fill="#00ACC1" opacity="0.1"/><circle cx="30" cy="30" r="16" fill="none" stroke="#00ACC1" stroke-width="2.5"/><line x1="30" y1="30" x2="30" y2="20" stroke="#00ACC1" stroke-width="2.5" stroke-linecap="round"/><line x1="30" y1="30" x2="38" y2="34" stroke="#00ACC1" stroke-width="2.5" stroke-linecap="round"/></svg>', color:'#00ACC1', gp:4, teks:'TEKS 3.7C, 3.7D, 3.7E, 3.8A, 3.8B',           lessons:_g3CloneLessons(_G3_U9_LESSONS),  _loaded:false },
  { id:'g3u10', name:'Personal Financial Literacy and CBE Final Review', icon:'💰', svg:'<svg viewBox="0 0 60 60" fill="none"><circle cx="30" cy="30" r="27" fill="#FBC02D" opacity="0.12"/><circle cx="30" cy="30" r="16" fill="none" stroke="#FBC02D" stroke-width="2.5"/><text x="30" y="36" text-anchor="middle" font-size="16" fill="#FBC02D">$</text></svg>', color:'#FBC02D', gp:4, teks:'TEKS 3.9A, 3.9B, 3.9C, 3.9D, 3.9E, 3.9F', lessons:_g3CloneLessons(_G3_U10_LESSONS), _loaded:false }
];

// ── Load infrastructure ────────────────────────────────────────────────────────
const _g3UnitLoadPromises = {};

function _loadG3SourceFile(num){
  return new Promise(function(res){
    var s = document.createElement('script');
    s.src = '/data/g3/u' + num + '.js';
    s.onload = res;
    s.onerror = function(){ console.warn('[G3] data/g3/u' + num + '.js not found — unit will show empty'); res(); };
    document.head.appendChild(s);
  });
}

function _loadG3Unit(idx){
  var u = _UNITS_DATA_G3[idx];
  if(!u) return Promise.resolve();
  if(u._loaded) return Promise.resolve();
  if(_g3UnitLoadPromises[idx]) return _g3UnitLoadPromises[idx];

  // Units with data files: idx 0 → u1.js … idx 9 → u10.js. Any future
  // shell-only unit beyond idx 9 short-circuits so the loader does not try
  // to fetch a file that doesn't exist yet.
  if(idx > 9){
    u._loaded = true;
    return Promise.resolve();
  }

  var fileNum = idx + 1;
  _g3UnitLoadPromises[idx] = _loadG3SourceFile(fileNum).then(function(){
    if(!u._loaded) u._loaded = true; // fallback if the script didn't call _mergeG3UnitData
  });
  return _g3UnitLoadPromises[idx];
}

// ── Unit test bank assembly helpers ──────────────────────────────────────────
//  Self-contained (no dependency on util.js, which loads after this file).

function _g3Shuffle(arr){
  for (var i = arr.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
  }
  return arr;
}

// Largest-remainder apportionment — distributes `total` across `weights`
// proportionally, returning integers that sum to `total`.
function _g3Apportion(total, weights){
  if (!weights || weights.length === 0) return [];
  var sumW = 0;
  for (var i = 0; i < weights.length; i++) sumW += weights[i];
  if (sumW === 0 || total === 0) return weights.map(function(){ return 0; });
  var quotas = weights.map(function(w){ return total * w / sumW; });
  var floors = quotas.map(function(q){ return Math.floor(q); });
  var allocated = 0;
  for (var k = 0; k < floors.length; k++) allocated += floors[k];
  var deficit = total - allocated;
  if (deficit <= 0) return floors;
  var indexed = quotas.map(function(q, i){ return { i: i, frac: q - Math.floor(q), tie: Math.random() }; });
  indexed.sort(function(a, b){ if (Math.abs(b.frac - a.frac) > 1e-9) return b.frac - a.frac; return a.tie - b.tie; });
  for (var d = 0; d < deficit && d < indexed.length; d++) floors[indexed[d].i]++;
  return floors;
}

// Assembles the FULL unit-test POOL from every lesson qBank question. Each
// returned question is a shallow clone tagged with source-lesson metadata
// (sourceLessonId/Title/Index, sourceUnitId). Original arrays are never
// mutated. Per-attempt sampling happens later via _sampleG3UnitTestAttempt.
function _assembleG3UnitTestBank(u){
  var result = [];
  (u.lessons || []).forEach(function(lesson, lessonIdx){
    var bank = lesson.qBank || [];
    for (var i = 0; i < bank.length; i++) {
      result.push(Object.assign({}, bank[i], {
        sourceLessonId:    lesson.id || null,
        sourceLessonTitle: lesson.title || null,
        sourceLessonIndex: lessonIdx,
        sourceUnitId:      u.id || null
      }));
    }
  });
  return result;
}

// Samples `n` questions from the full unit-test pool, balanced across lessons
// (as evenly as possible) and difficulty (target ~8E/10M/7H per 25, scaled).
// Never mutates `pool`. Mirrors the Grade 1 _sampleUnitTestAttempt behaviour.
function _sampleG3UnitTestAttempt(pool, n){
  if (!pool || pool.length === 0) return [];
  if (pool.length <= n) { var copy = pool.slice(); _g3Shuffle(copy); return copy; }

  var byLesson = {};
  for (var p = 0; p < pool.length; p++) {
    var idx = pool[p].sourceLessonIndex != null ? pool[p].sourceLessonIndex : 0;
    if (!byLesson[idx]) byLesson[idx] = [];
    byLesson[idx].push(pool[p]);
  }
  var lessonIndices = Object.keys(byLesson).map(Number).sort(function(a, b){ return a - b; });
  var numLessons = lessonIndices.length;
  if (numLessons === 0) return [];

  var base = Math.floor(n / numLessons);
  var bonus = n - base * numLessons;
  var lessonSizes = lessonIndices.map(function(){ return base; });
  if (bonus > 0) {
    var bonusOrder = lessonIndices.slice();
    _g3Shuffle(bonusOrder);
    for (var b = 0; b < bonus; b++) lessonSizes[lessonIndices.indexOf(bonusOrder[b])]++;
  }

  var eTotal = Math.round(n * 8 / 25);
  var mTotal = Math.round(n * 10 / 25);
  var hTotal = n - eTotal - mTotal;
  var ePerLesson = _g3Apportion(eTotal, lessonSizes);
  var afterE = lessonSizes.map(function(s, i){ return s - ePerLesson[i]; });
  var hPerLesson = _g3Apportion(hTotal, afterE);
  var mPerLesson = lessonSizes.map(function(s, i){ return afterE[i] - hPerLesson[i]; });

  var result = [];
  lessonIndices.forEach(function(lIdx, i){
    var lessonPool = byLesson[lIdx];
    var ePool = lessonPool.filter(function(q){ return q.d === 'e'; });
    var mPool = lessonPool.filter(function(q){ return q.d === 'm'; });
    var hPool = lessonPool.filter(function(q){ return q.d === 'h'; });
    _g3Shuffle(ePool); _g3Shuffle(mPool); _g3Shuffle(hPool);
    var picks = ePool.slice(0, ePerLesson[i]).concat(mPool.slice(0, mPerLesson[i])).concat(hPool.slice(0, hPerLesson[i]));
    var lessonTarget = lessonSizes[i];
    if (picks.length < lessonTarget) {
      var picked = picks.slice();
      var spillover = lessonPool.filter(function(q){ return picked.indexOf(q) === -1; });
      _g3Shuffle(spillover);
      var needed = lessonTarget - picks.length;
      for (var s = 0; s < needed && s < spillover.length; s++) picks.push(spillover[s]);
    }
    for (var pi = 0; pi < picks.length; pi++) result.push(picks[pi]);
  });
  _g3Shuffle(result);
  return result;
}

// ── Data merge (called by dist/data/g3/u{n}.js at parse time) ─────────────────
//  Grade 3 lessons are authored in the LEGACY compact shape. Merge fields
//  directly onto the shell (no v0.2.0 adapters), then assemble the unit-test
//  pool from the combined lesson qBanks when requested.
function _mergeG3UnitData(idx, spec){
  var u = _UNITS_DATA_G3[idx];
  if(!u){ console.error('[G3 merge] No unit at index', idx); return; }
  if(spec && Array.isArray(spec.lessons)){
    spec.lessons.forEach(function(ld, i){
      if(u.lessons[i]) Object.assign(u.lessons[i], ld);
      else u.lessons[i] = ld;
    });
  }
  if (spec && spec.unitTest) {
    u.unitTest = spec.unitTest;
    if (spec.unitTest.sourceRule === 'all_lesson_quizbanks') {
      u.testBank = _assembleG3UnitTestBank(u);
    } else if (Array.isArray(spec.unitTest.bank)) {
      u.testBank = spec.unitTest.bank;
    }
  }
  u._loaded = true;
}

// ── Grade swap ────────────────────────────────────────────────────────────────
//  Called from boot.js when localStorage.mmr_grade === '3'. Splices UNITS_DATA
//  in-place (same pattern as _applyKindergartenGrade / _applyGrade1Grade).
//  IMPORTANT: must NOT write mmr_grade — the student's selection is the source
//  of truth and is persisted elsewhere (switchGrade / enterStudentLearningSession).
function _applyGrade3Grade(){
  UNITS_DATA.splice(0, UNITS_DATA.length);
  _UNITS_DATA_G3.forEach(function(u){ UNITS_DATA.push(u); });
  window._loadUnit = _loadG3Unit;
}
