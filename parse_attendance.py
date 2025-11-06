import os
import re
import json
from html.parser import HTMLParser
from pathlib import Path

class StudentHTMLParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.in_table = False
        self.in_row = False
        self.in_cell = False
        self.current_row = []
        self.rows = []
        self.cell_count = 0

    def handle_starttag(self, tag, attrs):
        if tag == 'table':
            self.in_table = True
        elif tag == 'tr' and self.in_table:
            self.in_row = True
            self.current_row = []
            self.cell_count = 0
        elif tag == 'td' and self.in_row:
            self.in_cell = True
            self.cell_count += 1

    def handle_endtag(self, tag):
        if tag == 'table':
            self.in_table = False
        elif tag == 'tr':
            if self.in_row and self.current_row:
                self.rows.append(self.current_row)
            self.in_row = False
        elif tag == 'td':
            self.in_cell = False

    def handle_data(self, data):
        if self.in_cell and self.cell_count == 1:  # First column contains student names
            data = data.strip()
            if data:
                self.current_row.append(data)

def extract_english_name(full_name):
    """Extract English name from parentheses"""
    # Pattern for names like "Taegeon(Eden)" or "Manuel B. Nablo Jr. (Junno)"
    match = re.search(r'\(([^)]+)\)', full_name)
    if match:
        english_name = match.group(1).strip()

        # Only treat as English name if it looks like a name (not a note)
        # Skip things like "(moved to chess)", "(death of a relative)", etc.
        skip_words = ['moved', 'death', 'excused', 'yearbook', 'absent', 'in cebu', 'detention', 'stu co']
        if any(word in english_name.lower() for word in skip_words):
            # It's a note, keep the full name including parentheses
            return full_name, ""

        # Also skip if it contains "Gr." or similar grade indicators - they should be in grade field
        if re.match(r'^gr\.?\s*\d+$', english_name.lower()):
            # Extract and return without this in the English name
            full_name_cleaned = re.sub(r'\s*\([^)]+\)', '', full_name).strip()
            return full_name_cleaned, ""

        full_name_cleaned = re.sub(r'\s*\([^)]+\)', '', full_name).strip()
        return full_name_cleaned, english_name
    return full_name, ""

def extract_grade(text):
    """Extract grade level from text"""
    # Look for patterns like "Grade 7", "G7", "grade 8", "9th", "11th", "Gr. 7", "Gr.8", etc.

    # Pattern 1: "Grade 7" or "G7"
    match = re.search(r'(?:Grade|G)\s*(\d+)', text, re.IGNORECASE)
    if match:
        return f"Grade {match.group(1)}"

    # Pattern 2: "Gr. 7" or "Gr.8"
    match = re.search(r'Gr\.?\s*(\d+)', text, re.IGNORECASE)
    if match:
        return f"Grade {match.group(1)}"

    # Pattern 3: Grade numbers with suffix like "6th", "9th", "11th", "12th"
    match = re.search(r'\b(\d+)(?:st|nd|rd|th)\b', text)
    if match:
        grade_num = int(match.group(1))
        # Only accept reasonable grade numbers (6-12 for secondary school)
        if 6 <= grade_num <= 12:
            return f"Grade {grade_num}"

    # Pattern 4: In parentheses like "(Gr. 8)"
    match = re.search(r'\(Gr\.?\s*(\d+)\)', text, re.IGNORECASE)
    if match:
        return f"Grade {match.group(1)}"

    return ""

def clean_name(name):
    """Clean up student name by removing notes and extra whitespace"""
    # Remove notes like "Never seen him", "Not sure", "moved to chess", etc.
    name = re.sub(r'-\s*Never seen.*$', '', name, flags=re.IGNORECASE)
    name = re.sub(r'-\s*Not sure.*$', '', name, flags=re.IGNORECASE)
    name = re.sub(r'\s*\(moved to.*\)', '', name, flags=re.IGNORECASE)

    # Remove grade indicators from the end of names
    # "Ayra Mari Dantis 9th" -> "Ayra Mari Dantis"
    name = re.sub(r'\s+\d+(?:st|nd|rd|th)\s*$', '', name)

    # Remove "Gr. 7" or "Gr.8" patterns from names
    name = re.sub(r'\s+Gr\.?\s*\d+\s*$', '', name, flags=re.IGNORECASE)

    # Remove parenthetical grade indicators like "(Gr. 8)"
    name = re.sub(r'\s*\(Gr\.?\s*\d+\)', '', name, flags=re.IGNORECASE)

    # Remove trailing whitespace and dashes
    name = name.strip().rstrip('-').strip()

    return name

def is_valid_student_name(name):
    """Check if the name looks like a valid student name"""
    # Skip date-based entries like "10/14 - Ayra Dantis"
    if re.match(r'^\d+/\d+', name):
        return False

    # Skip entries that are just dates, numbers, or too short
    if len(name) < 3:
        return False

    # Skip entries that look like messages/notes (contain common message words)
    message_keywords = ['hello', 'hi,', 'please', 'thank you', 'thanks', 'i\'ve', 'i am',
                        'mr.', 'ms.', 'mrs.', 'attendance', 'mark', 'added', 'changed']
    name_lower = name.lower()
    if any(keyword in name_lower for keyword in message_keywords):
        return False

    # Skip placeholder/role names
    placeholder_keywords = ['student names', 'student name', 'teacher', 'varsity team', 'coach']
    if name_lower in placeholder_keywords or name_lower.strip() in placeholder_keywords:
        return False

    # Skip entries that are too long (likely notes/messages)
    if len(name) > 50:
        return False

    # Skip entries that look like notes or admin text
    skip_patterns = [
        r'^absent',
        r'^excused',
        r'^detention',
        r'^in cebu',
        r'^death of',
        r'^yearbook',
        r'^\d+th$',  # Just grade numbers like "11th"
        r'^\d+$',    # Just numbers
        r'^gr\.?\s*\d+$',  # Just "Gr. 7" or "Gr.8"
    ]

    for pattern in skip_patterns:
        if re.match(pattern, name_lower):
            return False

    return True

def extract_students_from_html(html_file):
    """Extract student names from an HTML file"""
    with open(html_file, 'r', encoding='utf-8') as f:
        content = f.read()

    parser = StudentHTMLParser()
    parser.feed(content)

    students = []
    for row in parser.rows:
        if row:
            name = row[0]

            # Skip header rows or empty names
            if not name or name.lower() in ['student name', 'student', '']:
                continue

            # Skip rows that are just notes or don't look like names
            if any(x in name.lower() for x in ['attendance guide', 'w/ coach', 'no coach', 'coach', 'detention', 'stu co']):
                continue

            # Validate the name (BEFORE cleaning so we can check the original)
            if name and is_valid_student_name(name):
                # Don't clean here - we'll do it after extracting grade info
                students.append(name)

    return students

def parse_all_html_files(folder_path):
    """Parse all HTML files in the folder and extract student information"""
    folder = Path(folder_path)
    all_students = {}  # Use dict to track unique students: {student_key: student_data}

    # Get all HTML files
    html_files = list(folder.glob('*.html'))

    for html_file in html_files:
        activity_name = html_file.stem  # Get filename without extension
        print(f"Processing: {activity_name}")

        students = extract_students_from_html(html_file)

        for name in students:
            # Extract grade FIRST (from original name with "9th", "Gr.8", etc.)
            grade = extract_grade(name)

            # Then extract English name (this also cleans parentheses)
            full_name, english_name = extract_english_name(name)

            # Finally, clean the full name to remove grade suffixes and notes
            full_name = clean_name(full_name)

            # Create a unique key for deduplication (case-insensitive)
            student_key = full_name.lower().replace(' ', '').replace('.', '')

            # If student already exists, just add the source
            if student_key in all_students:
                if activity_name not in all_students[student_key]['sources']:
                    all_students[student_key]['sources'].append(activity_name)
            else:
                # New student
                all_students[student_key] = {
                    'full_name': full_name,
                    'english_name': english_name,
                    'grade': grade,
                    'sources': [activity_name]
                }

    return all_students

def main():
    # Paths
    input_folder = r"C:\Users\Dennis\Downloads\Attendance ASA (Secondary Q1 25_26)"
    output_md = r"C:\Users\Dennis\Desktop\Projects\md-system\data\all-students-roster.md"
    output_json = r"C:\Users\Dennis\Desktop\Projects\md-system\data\all-students-roster.json"

    # Ensure output directory exists
    os.makedirs(os.path.dirname(output_md), exist_ok=True)

    # Parse all files
    print("Parsing HTML files...")
    all_students = parse_all_html_files(input_folder)

    # Sort by full name
    sorted_students = sorted(all_students.values(), key=lambda x: x['full_name'].lower())

    # Generate markdown table
    md_lines = [
        "# All Students Roster",
        "",
        "| # | Full Name | English Name | Grade | Source |",
        "|---|-----------|--------------|-------|--------|"
    ]

    for i, student in enumerate(sorted_students, 1):
        sources = ', '.join(student['sources'])
        md_lines.append(
            f"| {i} | {student['full_name']} | {student['english_name']} | {student['grade']} | {sources} |"
        )

    # Add summary
    students_with_grades = sum(1 for s in sorted_students if s['grade'])
    students_with_english = sum(1 for s in sorted_students if s['english_name'])

    md_lines.extend([
        "",
        "## Summary",
        "",
        f"- **Total unique students:** {len(sorted_students)}",
        f"- **Students with grades specified:** {students_with_grades}",
        f"- **Students with English names:** {students_with_english}"
    ])

    # Write markdown file
    with open(output_md, 'w', encoding='utf-8') as f:
        f.write('\n'.join(md_lines))

    # Prepare JSON data
    json_data = {
        'total_students': len(sorted_students),
        'students_with_grades': students_with_grades,
        'students_with_english_names': students_with_english,
        'students': sorted_students
    }

    # Write JSON file
    with open(output_json, 'w', encoding='utf-8') as f:
        json.dump(json_data, f, indent=2, ensure_ascii=False)

    # Print summary
    print("\n" + "="*60)
    print("PARSING COMPLETE")
    print("="*60)
    print(f"Total unique students found: {len(sorted_students)}")
    print(f"Students with grades specified: {students_with_grades}")
    print(f"Students with English names: {students_with_english}")
    print(f"\nMarkdown file saved to: {output_md}")
    print(f"JSON file saved to: {output_json}")

if __name__ == "__main__":
    main()
