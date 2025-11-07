import csv
import json

# Parse the masterlist CSV and extract grades 6-12
def parse_masterlist(csv_path):
    students_6_12 = []

    with open(csv_path, 'r', encoding='utf-8') as f:
        # Skip first line (date header)
        next(f)

        reader = csv.reader(f)
        header = next(reader)  # Get header row

        for row in reader:
            if len(row) < 7:
                continue

            # Extract fields
            student_id = row[1].strip() if len(row) > 1 else ""
            official_name = row[2].strip() if len(row) > 2 else ""
            korean_name = row[3].strip() if len(row) > 3 else ""
            english_name = row[4].strip() if len(row) > 4 else ""
            grade = row[5].strip() if len(row) > 5 else ""
            gender = row[6].strip() if len(row) > 6 else ""

            # Skip if grade is not 6-12
            if grade not in ['6', '7', '8', '9', '10', '11', '12']:
                continue

            # Skip if no student ID or is "NEW" (we'll handle these separately)
            if not student_id or student_id == "NEW":
                continue

            # Skip withdrawn students section
            if "WITHDRAWN" in official_name or "DID NOT RETURN" in official_name:
                break

            # Parse official name to get last name and first name
            if ',' in official_name:
                parts = official_name.split(',')
                last_name = parts[0].strip()
                first_name = parts[1].strip() if len(parts) > 1 else ""
                full_name = f"{first_name} {last_name}".strip()
            else:
                full_name = official_name

            students_6_12.append({
                'student_id': student_id,
                'official_name': official_name,
                'full_name': full_name,
                'korean_name': korean_name,
                'english_name': english_name,
                'grade': grade,
                'gender': gender
            })

    return students_6_12

# Parse the CSV
csv_path = r'c:\Users\Dennis\Downloads\Masterlist  - Masterlist 25-26.csv'
students = parse_masterlist(csv_path)

# Print summary
print(f"Found {len(students)} students in grades 6-12")
print("\nFirst 10 students:")
for i, student in enumerate(students[:10]):
    print(f"{i+1}. ID: {student['student_id']}, Name: {student['full_name']}, English: {student['english_name']}, Grade: {student['grade']}")

# Save to JSON for analysis
with open('masterlist_6_12.json', 'w', encoding='utf-8') as f:
    json.dump(students, f, indent=2, ensure_ascii=False)

print(f"\nSaved {len(students)} students to masterlist_6_12.json")

# Group by grade
by_grade = {}
for student in students:
    grade = student['grade']
    if grade not in by_grade:
        by_grade[grade] = []
    by_grade[grade].append(student)

print("\nStudents by grade:")
for grade in sorted(by_grade.keys(), key=lambda x: int(x)):
    print(f"  Grade {grade}: {len(by_grade[grade])} students")
