import json

# Load comparison results
with open('comparison_results.json', 'r', encoding='utf-8') as f:
    results = json.load(f)

# Load full masterlist
with open('masterlist_6_12.json', 'r', encoding='utf-8') as f:
    masterlist = json.load(f)

print("=== GENERATING SQL UPDATE SCRIPT ===\n")

# Create a SQL migration file
sql_statements = []
sql_statements.append("-- Update student names from masterlist")
sql_statements.append("-- Generated automatically - REVIEW BEFORE RUNNING\n")

# 1. Name mismatches to update (only safe ones)
print("1. NAME UPDATES (Fix formatting differences)")
print("=" * 60)

safe_updates = [
    # These are clearly the same person, just formatting differences
    ("d1553c88-8e96-4cd4-9b37-1f1ca5b221e2", "Gabriel Alexander Albrecht", "Gabriel"),  # Gabriel
    ("82f42c8d-4dd5-4ccf-aaca-5e9ac1668167", "Seryn Kyung", "Seryn"),  # Seryn - remove comma
    ("2c405160-b725-4cf7-a72c-ec94906eace6", "Myra James Williams", "Myra"),  # Myra - add middle name
    ("3ab2cbba-ae54-4cda-b6da-2a2fc9fbd46f", "Sanghyuk Go", "Jason"),  # Jason - fix name order
    ("ded472a1-6405-4422-8aa4-a603295dde54", "Benjamin Jake Osabel Garland", "Benjamin"),  # Benjamin - add full name
    ("52b6a305-9727-45cb-8e3b-6ec098d20780", "Azra Nez Gabrielle Perez Lumbu-an", "Azra"),  # Azra - add full name
    ("b5af66fe-a958-475a-955e-9144231ac75e", "Aryanna Destiny Portugaliza Wegner", "Aryanna"),  # Aryanna - add middle name
    ("7c2ba891-7eaa-4672-9d01-4d8a347dd4c7", "Timo Wendelin Frey", "Timo"),  # Timo - add middle name
    ("1014", "Shiyu Huang", "Kevin"),  # Fix Huang Shiyu formatting
    ("7a3a5047-7477-433f-886c-08657b1298dd", "Shinwook Kim", "Shinwook"),  # Shinwook - add last name
    ("9b6b75ff-9023-4c17-bc95-7a53aa68dd1e", "Youeun Kim", "Anne"),  # Anne - remove comma
    ("2ac4db47-ba4d-4fe0-b1a9-535148229896", "Seungwon Lee", "Daven"),  # Daven - fix formatting
    ("eb8c255b-c7a9-4145-b0b8-2777fa1de738", "Gahyun Park", "Katie"),  # Katie - fix formatting
]

# PROBLEMATIC MATCHES TO SKIP (different people with same English name)
# - "Huang, Shiyu" / "Kevin" matched with "Minsung Kim" / "Kevin" - WRONG!
# - "Huang, Shiyu" / "Kevin" matched with "Siyue Chen" / "Kevin" - WRONG!
# - "Sean Park" matched with "Sean Lee" - WRONG!
# - "Jacob Park" matched with "Jon Jacob Smith" - WRONG!

for student_id, full_name, english_name in safe_updates:
    print(f"  UPDATE: {full_name} ({english_name}) [ID: {student_id}]")
    sql_statements.append(f"UPDATE students SET full_name = '{full_name}', english_name = '{english_name}' WHERE id = '{student_id}';")

sql_statements.append("")

# 2. Students to ADD
print(f"\n2. NEW STUDENTS TO ADD")
print("=" * 60)

# Group by grade for better organization
to_add_by_grade = {}
for student in results['not_in_db']:
    grade = student['grade']
    if grade not in to_add_by_grade:
        to_add_by_grade[grade] = []
    to_add_by_grade[grade].append(student)

print(f"Total: {len(results['not_in_db'])} students\n")

sql_statements.append("-- Add missing students from masterlist")
for grade in sorted(to_add_by_grade.keys(), key=lambda x: int(x)):
    students = to_add_by_grade[grade]
    print(f"Grade {grade}: {len(students)} students")
    sql_statements.append(f"\n-- Grade {grade}")

    for student in students:
        full_name = student['full_name'].replace("'", "''")  # Escape single quotes
        english_name = student['english_name'].replace("'", "''") if student['english_name'] else student['full_name'].split()[0]

        sql_statements.append(
            f"INSERT INTO students (full_name, english_name, grade) "
            f"VALUES ('{full_name}', '{english_name}', '{grade}');"
        )

# 3. Students in DB but not in masterlist - KEEP THEM (they may have signed up)
print(f"\n3. STUDENTS IN DATABASE BUT NOT IN MASTERLIST")
print("=" * 60)
print("Keeping these students - they may have already signed up with Google accounts:")
for student in results['not_in_masterlist']:
    print(f"  - Grade {student['grade']}: {student['full_name']} ({student['english_name']})")

sql_statements.append("\n-- Students in database but not in masterlist - KEEPING THEM (may have signed up already)")
for student in results['not_in_masterlist']:
    sql_statements.append(f"-- KEEP: {student['full_name']} ({student['english_name']}) - Grade {student['grade']}")

# Write SQL file
with open('update_students.sql', 'w', encoding='utf-8') as f:
    f.write('\n'.join(sql_statements))

print(f"\n\nSQL script generated: update_students.sql")
print("\n⚠️  IMPORTANT: Review the SQL script before running!")
print("    Some matches may need manual verification.")
