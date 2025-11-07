import csv
import json

# Parse the masterlist CSV again to get exact names
def parse_masterlist_detailed(csv_path):
    students = {}

    with open(csv_path, 'r', encoding='utf-8') as f:
        next(f)  # Skip date
        reader = csv.reader(f)
        next(reader)  # Skip header

        for row in reader:
            if len(row) < 7:
                continue

            student_id = row[1].strip() if len(row) > 1 else ""
            official_name = row[2].strip() if len(row) > 2 else ""
            korean_name = row[3].strip() if len(row) > 3 else ""
            english_name = row[4].strip() if len(row) > 4 else ""
            grade = row[5].strip() if len(row) > 5 else ""

            if grade not in ['6', '7', '8', '9', '10', '11', '12']:
                continue
            if not student_id or student_id == "NEW":
                continue
            if "WITHDRAWN" in official_name:
                break

            # Parse full name
            if ',' in official_name:
                parts = official_name.split(',')
                last_name = parts[0].strip()
                first_name = parts[1].strip() if len(parts) > 1 else ""
                full_name = f"{first_name} {last_name}".strip()
            else:
                full_name = official_name

            students[student_id] = {
                'id': student_id,
                'full_name': full_name,
                'english_name': english_name,
                'grade': grade
            }

    return students

csv_path = r'c:\Users\Dennis\Downloads\Masterlist  - Masterlist 25-26.csv'
masterlist = parse_masterlist_detailed(csv_path)

# Manual mapping for students already in DB that need updates
db_to_masterlist_id = {
    # Grade 6
    "71472064-84c8-44d7-a128-31836aef46a4": "1050",  # Cho, Soojeong Diaz -> Soojeong Diaz Cho
    "d1553c88-8e96-4cd4-9b37-1f1ca5b221e2": "1138",  # Gabriel Albrecht
    "82f42c8d-4dd5-4ccf-aaca-5e9ac1668167": "1111",  # Kyung,Seryn
    "2c405160-b725-4cf7-a72c-ec94906eace6": "875",   # Myra Williams
    "283824f9-4e87-463d-8d28-71ba0edd51fa": "780",   # SheenBee Oh
    "10cb153f-a753-49eb-a6a9-dadcc17009a9": "1140",  # Vhretchard -> Vhretchard Mateo

    # Grade 7
    "9983a860-9917-4235-990e-85d97a40930e": "1199",  # Camry Tobias
    "bcb6152d-e1a8-41e8-8afd-71349d4d4043": "846",   # Headley, Cataleyna Sophia
    "a337c653-8973-4bff-bc28-1fd2a02d99c2": "1053",  # Jacob Park -> Jacob Leejun Park
    "3ab2cbba-ae54-4cda-b6da-2a2fc9fbd46f": "948",   # Jason Go Sanghyuk

    # Grade 8
    "b5af66fe-a958-475a-955e-9144231ac75e": "465",   # Aryanna Destiny Wegner
    "52b6a305-9727-45cb-8e3b-6ec098d20780": "951",   # Azra Nez Gabrielle P.
    "ded472a1-6405-4422-8aa4-a603295dde54": "432",   # Benjamin Garland
    "4b3a7ce3-c6cd-4571-92bf-6b67a10df799": "1098",  # Cho, Yeonkyu
    "b3efd0a7-e49c-404e-8546-ba9f40710105": "776",   # Gel Emrie Stanley
    "663de372-a693-4dce-b595-ecc8ebf1b30c": "1204",  # Irene Caminero
    "0eecdec8-f467-4bb5-b6f0-956871a627dd": "1065",  # Jayrielle Miriam Mirasol
    "b3452e39-0470-479e-8c03-d557827fef1f": "362",   # Jon Jacob Smith -> Jon Jacob Dayrit Smith
    "54f846a2-6558-418f-b04b-86d7af6c0152": "1056",  # Timothy Jefferson P Dayrit

    # Grade 9
    "e14d8495-1592-4d08-8e1c-c5f419d93aa1": "1208",  # Ayra Mari Dantis
    "0940416d-e41e-4b3e-9c83-18d9f7c58a70": "1227",  # Gyuri Lim
    "00e6f84f-4169-485a-85e8-8f3de0b29d9b": "1181",  # Seokyung Joo

    # Grade 10
    "90ef100c-27ec-4c44-9dcf-9be93d874f75": "1014",  # Huang, Shiyu
    "76a9445b-f64a-495f-8665-8203b8fe80b5": "1167",  # Jaehyun Choi
    "76e21f92-562a-4a85-bf59-612e3b0b8865": "528",   # Jasmine Kelly Line
    "2160b0dc-045a-4f33-9915-c1b8c46e83e5": "1192",  # Jooeun Park
    "9b6b75ff-9023-4c17-bc95-7a53aa68dd1e": "1168",  # Kim, Youeun
    "2ac4db47-ba4d-4fe0-b1a9-535148229896": "1116",  # Lee Seungwon
    "72d8939a-8ace-437f-84cc-73bcac45242e": "1073",  # Riwon Kim
    "5d04e081-4d73-4b69-a654-632fff2cceb7": "1117",  # Seoyeon Park
    "fe6a54c6-fe8f-4440-900b-1639c440a34b": "760",   # Serin Park
    "7a3a5047-7477-433f-886c-08657b1298dd": "886",   # SHINWOOK -> Shinwook Kim
    "b3f9bef4-6916-4102-896a-70d0e3a06eb8": "837",   # Sieun Kwon
    "4244139a-2806-4b30-9c5a-a28ec91c281b": "1213",  # Subhin Oh
    "7c2ba891-7eaa-4672-9d01-4d8a347dd4c7": "1211",  # Timo Frey

    # Grade 11
    "d6720f25-cb44-4e1b-b701-8f583f4c0d54": "920",   # Bat-Ochir Odmandakh
    "06fb8e53-fd8b-43d6-a3cc-b61ee125123b": "1082",  # John Mirasol -> John Marcial Mirasol
    "eb8c255b-c7a9-4145-b0b8-2777fa1de738": "1085",  # Park Gahyun -> Gahyun Park
    "29993a12-33fb-44ce-96df-13350be23106": "959",   # Seojin joug -> Seojin Joug

    # Grade 12
    "5f10486c-bb85-43a5-bd19-e01615b64d6f": "1217",  # An, Yujun
    "16db0e33-0f68-40b8-9027-72e7818bdbdb": "1190",  # Jaehoon -> Jaehoon Sohn
    "0665fa71-f155-4090-833b-6b11a359ba58": "977",   # Sean Park -> Sieon Park
    # "3740bcd9-9b8f-43be-ac71-002f16ab6c27": SKIP - This is Song Sam Dong (test account)
}

# Generate SQL
sql = []
sql.append("-- Update existing students with correct names from masterlist")
sql.append("-- Generated automatically\n")

print("=== UPDATING EXISTING STUDENTS ===\n")

for db_id, ml_id in db_to_masterlist_id.items():
    if ml_id in masterlist:
        ml_student = masterlist[ml_id]
        full_name = ml_student['full_name'].replace("'", "''")
        english_name = ml_student['english_name'].replace("'", "''") if ml_student['english_name'] else full_name.split()[0]

        print(f"UPDATE: {full_name} ({english_name}) - Grade {ml_student['grade']}")
        sql.append(f"UPDATE students SET full_name = '{full_name}', english_name = '{english_name}', grade = '{ml_student['grade']}' WHERE id = '{db_id}';")

# Get list of all masterlist IDs that are already handled
handled_ids = set(db_to_masterlist_id.values())

# Add students not in database
sql.append("\n-- Add new students from masterlist")
print(f"\n=== ADDING NEW STUDENTS ===\n")

by_grade = {}
for ml_id, student in masterlist.items():
    if ml_id not in handled_ids:
        grade = student['grade']
        if grade not in by_grade:
            by_grade[grade] = []
        by_grade[grade].append(student)

for grade in sorted(by_grade.keys(), key=lambda x: int(x)):
    students = by_grade[grade]
    print(f"Grade {grade}: {len(students)} students")
    sql.append(f"\n-- Grade {grade}")

    for student in students:
        full_name = student['full_name'].replace("'", "''")
        english_name = student['english_name'].replace("'", "''") if student['english_name'] else full_name.split()[0]

        sql.append(f"INSERT INTO students (full_name, english_name, grade) VALUES ('{full_name}', '{english_name}', '{grade}');")

# Write SQL file
with open('final_update_students.sql', 'w', encoding='utf-8') as f:
    f.write('\n'.join(sql))

print(f"\n\nSQL script generated: final_update_students.sql")
print(f"Total updates: {len(db_to_masterlist_id)}")
print(f"Total new students: {len(masterlist) - len(handled_ids)}")
