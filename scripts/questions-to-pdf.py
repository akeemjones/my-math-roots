#!/usr/bin/env python3
"""
Generate a PDF of all generated questions for review.
Reads all JSON files from scripts/generated/ and creates a formatted PDF.
"""

import json
import os
import re
from pathlib import Path

from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.colors import HexColor
from reportlab.lib.enums import TA_LEFT, TA_CENTER
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, PageBreak,
    Table, TableStyle, KeepTogether
)

# --- Config ---
GENERATED_DIR = Path(__file__).parent / "generated"
OUTPUT_PDF = Path(__file__).parent.parent / "My_Math_Roots_Question_Bank.pdf"

UNIT_NAMES = {
    1: "Basic Fact Strategies",
    2: "Place Value",
    3: "Add & Subtract to 200",
    4: "Subtraction",
    5: "Money",
    6: "Data & Graphs",
    7: "Measurement & Time",
    8: "Fractions",
    9: "Geometry",
    10: "Multiplication & Division",
}

LESSON_NAMES = {
    "u1": ["Count Up & Count Back", "Doubles!", "Make a 10", "Number Families"],
    "u2": ["Big Numbers", "Different Ways to Write Numbers", "Bigger or Smaller?", "Skip Counting"],
    "u3": ["Adding Bigger Numbers", "Taking Away Bigger Numbers", "Add Three Numbers", "Word Problems"],
    "u4": ["Subtract Without Regrouping", "Subtract With Regrouping", "Check Your Work", "Subtraction Word Problems"],
    "u5": ["Know Your Coins", "Count Your Money", "Dollar Signs & Decimal Points", "Making Change"],
    "u6": ["Tally Charts & Bar Graphs", "Pictographs", "Read and Answer Questions", "Line Plots"],
    "u7": ["How Long Is It?", "What Time Is It?", "Hot, Cold and Full"],
    "u8": ["What is a Fraction?", "Halves, Fourths and Eighths", "Which Piece is Bigger?"],
    "u9": ["Flat Shapes", "Solid Shapes", "Mirror Shapes"],
    "u10": ["Equal Groups", "Adding the Same Number", "Sharing Equally"],
}

DIFF_LABELS = {"e": "Easy", "m": "Medium", "h": "Hard"}
DIFF_COLORS = {
    "e": HexColor("#2E7D32"),  # green
    "m": HexColor("#E65100"),  # orange
    "h": HexColor("#C62828"),  # red
}


def parse_filename(fname):
    """Parse u1-l2-e.json -> (unit=1, lesson=2, diff='e', is_testbank=False)"""
    m = re.match(r"u(\d+)-l(\d+)-([emh])\.json", fname)
    if m:
        return int(m.group(1)), int(m.group(2)), m.group(3), False
    m = re.match(r"u(\d+)-testbank-([emh])\.json", fname)
    if m:
        return int(m.group(1)), None, m.group(2), True
    return None, None, None, None


def build_pdf():
    styles = getSampleStyleSheet()

    # Custom styles
    styles.add(ParagraphStyle(
        name="UnitTitle",
        parent=styles["Heading1"],
        fontSize=18,
        spaceAfter=6,
        textColor=HexColor("#1565C0"),
        borderWidth=1,
        borderColor=HexColor("#1565C0"),
        borderPadding=6,
    ))
    styles.add(ParagraphStyle(
        name="LessonTitle",
        parent=styles["Heading2"],
        fontSize=14,
        spaceAfter=4,
        textColor=HexColor("#37474F"),
    ))
    styles.add(ParagraphStyle(
        name="DiffHeader",
        parent=styles["Heading3"],
        fontSize=12,
        spaceAfter=4,
    ))
    styles.add(ParagraphStyle(
        name="QuestionText",
        parent=styles["Normal"],
        fontSize=10,
        leading=13,
        spaceBefore=6,
        spaceAfter=2,
        leftIndent=12,
    ))
    styles.add(ParagraphStyle(
        name="ChoiceText",
        parent=styles["Normal"],
        fontSize=9,
        leading=11,
        leftIndent=30,
        textColor=HexColor("#424242"),
    ))
    styles.add(ParagraphStyle(
        name="AnswerText",
        parent=styles["Normal"],
        fontSize=9,
        leading=11,
        leftIndent=30,
        textColor=HexColor("#1B5E20"),
    ))
    styles.add(ParagraphStyle(
        name="ExplanationText",
        parent=styles["Normal"],
        fontSize=8,
        leading=10,
        leftIndent=30,
        textColor=HexColor("#616161"),
        fontName="Helvetica-Oblique",
    ))
    styles.add(ParagraphStyle(
        name="TOCEntry",
        parent=styles["Normal"],
        fontSize=10,
        leading=14,
        leftIndent=20,
    ))
    styles.add(ParagraphStyle(
        name="StatsText",
        parent=styles["Normal"],
        fontSize=10,
        leading=13,
        alignment=TA_CENTER,
    ))

    # Gather all files
    files = sorted(GENERATED_DIR.glob("*.json"))
    if not files:
        print("No JSON files found in", GENERATED_DIR)
        return

    # Organize: {unit_n: {(lesson_n or 'test'): {diff: questions}}}
    organized = {}
    total_q = 0
    for f in files:
        unit_n, lesson_n, diff, is_test = parse_filename(f.name)
        if unit_n is None:
            continue
        with open(f, "r", encoding="utf-8") as fh:
            questions = json.load(fh)
        total_q += len(questions)
        key = "testbank" if is_test else lesson_n
        organized.setdefault(unit_n, {}).setdefault(key, {})[diff] = questions

    # Build document
    doc = SimpleDocTemplate(
        str(OUTPUT_PDF),
        pagesize=letter,
        topMargin=0.6 * inch,
        bottomMargin=0.6 * inch,
        leftMargin=0.7 * inch,
        rightMargin=0.7 * inch,
    )

    story = []

    # --- Cover page ---
    story.append(Spacer(1, 2 * inch))
    story.append(Paragraph("My Math Roots", styles["Title"]))
    story.append(Spacer(1, 12))
    story.append(Paragraph("Complete Question Bank Review", styles["Heading2"]))
    story.append(Spacer(1, 24))
    story.append(Paragraph(f"<b>{total_q}</b> Questions across <b>{len(organized)}</b> Units", styles["StatsText"]))
    story.append(Paragraph("Easy | Medium | Hard for every lesson and test bank", styles["StatsText"]))
    story.append(Spacer(1, 12))
    story.append(Paragraph("Grade 2 | Texas TEKS Aligned", styles["StatsText"]))
    story.append(PageBreak())

    # --- Table of Contents ---
    story.append(Paragraph("Table of Contents", styles["Title"]))
    story.append(Spacer(1, 12))
    for unit_n in sorted(organized.keys()):
        unit_name = UNIT_NAMES.get(unit_n, f"Unit {unit_n}")
        unit_key = f"u{unit_n}"
        # Count questions in this unit
        unit_total = sum(
            len(qs)
            for section in organized[unit_n].values()
            for qs in section.values()
        )
        story.append(Paragraph(
            f"<b>Unit {unit_n}: {unit_name}</b> ({unit_total} questions)",
            styles["TOCEntry"]
        ))
        for section_key in sorted(organized[unit_n].keys(), key=lambda x: (x == "testbank", x)):
            if section_key == "testbank":
                label = "Unit Test Bank"
            else:
                lessons = LESSON_NAMES.get(unit_key, [])
                idx = section_key - 1
                label = f"Lesson {section_key}: {lessons[idx]}" if idx < len(lessons) else f"Lesson {section_key}"
            sec_total = sum(len(qs) for qs in organized[unit_n][section_key].values())
            story.append(Paragraph(
                f"&nbsp;&nbsp;&nbsp;&nbsp;{label} ({sec_total} questions)",
                styles["TOCEntry"]
            ))
    story.append(PageBreak())

    # --- Questions ---
    for unit_n in sorted(organized.keys()):
        unit_name = UNIT_NAMES.get(unit_n, f"Unit {unit_n}")
        unit_key = f"u{unit_n}"

        story.append(Paragraph(f"Unit {unit_n}: {unit_name}", styles["UnitTitle"]))
        story.append(Spacer(1, 8))

        sections = organized[unit_n]
        for section_key in sorted(sections.keys(), key=lambda x: (x == "testbank", x)):
            if section_key == "testbank":
                section_label = "Unit Test Bank"
            else:
                lessons = LESSON_NAMES.get(unit_key, [])
                idx = section_key - 1
                section_label = f"Lesson {section_key}: {lessons[idx]}" if idx < len(lessons) else f"Lesson {section_key}"

            story.append(Paragraph(section_label, styles["LessonTitle"]))
            story.append(Spacer(1, 4))

            for diff in ["e", "m", "h"]:
                if diff not in sections[section_key]:
                    continue
                questions = sections[section_key][diff]
                diff_label = DIFF_LABELS[diff]
                diff_color = DIFF_COLORS[diff]

                diff_style = ParagraphStyle(
                    name=f"DiffHeader_{diff}_{unit_n}_{section_key}",
                    parent=styles["DiffHeader"],
                    textColor=diff_color,
                )
                story.append(Paragraph(
                    f"{diff_label} ({len(questions)} questions)",
                    diff_style
                ))

                for i, q in enumerate(questions, 1):
                    q_elements = []

                    # Question text
                    q_text = q.get("t", "???").replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
                    q_elements.append(Paragraph(f"<b>{i}.</b> {q_text}", styles["QuestionText"]))

                    # Choices
                    correct_idx = q.get("a", -1)
                    options = q.get("o", [])
                    choice_labels = ["A", "B", "C", "D"]
                    for j, opt in enumerate(options):
                        opt_text = str(opt).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
                        if j == correct_idx:
                            q_elements.append(Paragraph(
                                f"<b>{choice_labels[j]}. {opt_text}</b>  &#10004;",
                                styles["AnswerText"]
                            ))
                        else:
                            q_elements.append(Paragraph(
                                f"{choice_labels[j]}. {opt_text}",
                                styles["ChoiceText"]
                            ))

                    # Explanation
                    explanation = q.get("e", "").replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
                    if explanation:
                        q_elements.append(Paragraph(f"Explanation: {explanation}", styles["ExplanationText"]))

                    q_elements.append(Spacer(1, 4))
                    story.append(KeepTogether(q_elements))

            story.append(Spacer(1, 8))

        # Page break between units
        story.append(PageBreak())

    # Build
    doc.build(story)
    print(f"PDF created: {OUTPUT_PDF}")
    print(f"Total questions: {total_q}")
    print(f"Total files processed: {len(files)}")


if __name__ == "__main__":
    build_pdf()
