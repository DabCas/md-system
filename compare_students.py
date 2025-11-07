import json
import re

# Load masterlist data
with open('masterlist_6_12.json', 'r', encoding='utf-8') as f:
    masterlist = json.load(f)

# Current database students (from query)
db_students = [
    {"id": "71472064-84c8-44d7-a128-31836aef46a4", "full_name": "Cho, Soojeong Diaz", "english_name": "Soojeong", "grade": "6"},
    {"id": "d1553c88-8e96-4cd4-9b37-1f1ca5b221e2", "full_name": "Gabriel Albrecht", "english_name": "Gabriel", "grade": "6"},
    {"id": "82f42c8d-4dd5-4ccf-aaca-5e9ac1668167", "full_name": "Kyung,Seryn", "english_name": "Seryn", "grade": "6"},
    {"id": "2c405160-b725-4cf7-a72c-ec94906eace6", "full_name": "Myra Williams", "english_name": "Myra", "grade": "6"},
    {"id": "283824f9-4e87-463d-8d28-71ba0edd51fa", "full_name": "SheenBee Oh", "english_name": "SheenBee", "grade": "6"},
    {"id": "10cb153f-a753-49eb-a6a9-dadcc17009a9", "full_name": "Vhretchard", "english_name": "Vhretchard", "grade": "6"},
    {"id": "9983a860-9917-4235-990e-85d97a40930e", "full_name": "Camry Tobias", "english_name": "Camry", "grade": "7"},
    {"id": "bcb6152d-e1a8-41e8-8afd-71349d4d4043", "full_name": "Headley, Cataleyna Sophia", "english_name": "Cataleyna", "grade": "7"},
    {"id": "a337c653-8973-4bff-bc28-1fd2a02d99c2", "full_name": "Jacob Park", "english_name": "Jacob", "grade": "7"},
    {"id": "3ab2cbba-ae54-4cda-b6da-2a2fc9fbd46f", "full_name": "Jason Go Sanghyuk", "english_name": "Jason", "grade": "7"},
    {"id": "b5af66fe-a958-475a-955e-9144231ac75e", "full_name": "Aryanna Destiny Wegner", "english_name": "Aryanna", "grade": "8"},
    {"id": "52b6a305-9727-45cb-8e3b-6ec098d20780", "full_name": "Azra Nez Gabrielle P.", "english_name": "Azra", "grade": "8"},
    {"id": "ded472a1-6405-4422-8aa4-a603295dde54", "full_name": "Benjamin Garland", "english_name": "Benjamin", "grade": "8"},
    {"id": "4b3a7ce3-c6cd-4571-92bf-6b67a10df799", "full_name": "Cho, Yeonkyu", "english_name": "Yeonkyu", "grade": "8"},
    {"id": "b3efd0a7-e49c-404e-8546-ba9f40710105", "full_name": "Gel Emrie Stanley", "english_name": "Gel", "grade": "8"},
    {"id": "663de372-a693-4dce-b595-ecc8ebf1b30c", "full_name": "Irene Caminero", "english_name": "Irene", "grade": "8"},
    {"id": "0eecdec8-f467-4bb5-b6f0-956871a627dd", "full_name": "Jayrielle Miriam Mirasol", "english_name": "Jayrielle", "grade": "8"},
    {"id": "b3452e39-0470-479e-8c03-d557827fef1f", "full_name": "Jon Jacob Smith", "english_name": "Jon", "grade": "8"},
    {"id": "54f846a2-6558-418f-b04b-86d7af6c0152", "full_name": "Timothy Jefferson P Dayrit", "english_name": "Timothy", "grade": "8"},
    {"id": "e14d8495-1592-4d08-8e1c-c5f419d93aa1", "full_name": "Ayra Mari Dantis", "english_name": "Ayra", "grade": "9"},
    {"id": "0940416d-e41e-4b3e-9c83-18d9f7c58a70", "full_name": "Gyuri Lim", "english_name": "Gyuri", "grade": "9"},
    {"id": "00e6f84f-4169-485a-85e8-8f3de0b29d9b", "full_name": "Seokyung Joo", "english_name": "Luna", "grade": "9"},
    {"id": "90ef100c-27ec-4c44-9dcf-9be93d874f75", "full_name": "Huang, Shiyu", "english_name": "Kevin", "grade": "10"},
    {"id": "76a9445b-f64a-495f-8665-8203b8fe80b5", "full_name": "Jaehyun Choi", "english_name": "Jaehyun", "grade": "10"},
    {"id": "76e21f92-562a-4a85-bf59-612e3b0b8865", "full_name": "Jasmine Kelly Line", "english_name": "Jas", "grade": "10"},
    {"id": "2160b0dc-045a-4f33-9915-c1b8c46e83e5", "full_name": "Jooeun Park", "english_name": "Julia", "grade": "10"},
    {"id": "9b6b75ff-9023-4c17-bc95-7a53aa68dd1e", "full_name": "Kim, Youeun", "english_name": "Anne", "grade": "10"},
    {"id": "2ac4db47-ba4d-4fe0-b1a9-535148229896", "full_name": "Lee Seungwon", "english_name": "Daven", "grade": "10"},
    {"id": "72d8939a-8ace-437f-84cc-73bcac45242e", "full_name": "Riwon Kim", "english_name": "Riwon", "grade": "10"},
    {"id": "5d04e081-4d73-4b69-a654-632fff2cceb7", "full_name": "Seoyeon Park", "english_name": "Seoyeon", "grade": "10"},
    {"id": "fe6a54c6-fe8f-4440-900b-1639c440a34b", "full_name": "Serin Park", "english_name": "Serin", "grade": "10"},
    {"id": "7a3a5047-7477-433f-886c-08657b1298dd", "full_name": "SHINWOOK", "english_name": "SHINWOOK", "grade": "10"},
    {"id": "b3f9bef4-6916-4102-896a-70d0e3a06eb8", "full_name": "Sieun Kwon", "english_name": "Emily", "grade": "10"},
    {"id": "4244139a-2806-4b30-9c5a-a28ec91c281b", "full_name": "Subhin Oh", "english_name": "Amy", "grade": "10"},
    {"id": "7c2ba891-7eaa-4672-9d01-4d8a347dd4c7", "full_name": "Timo Frey", "english_name": "Timo", "grade": "10"},
    {"id": "d6720f25-cb44-4e1b-b701-8f583f4c0d54", "full_name": "Bat-Ochir Odmandakh", "english_name": "Ochko", "grade": "11"},
    {"id": "06fb8e53-fd8b-43d6-a3cc-b61ee125123b", "full_name": "John Mirasol", "english_name": "John", "grade": "11"},
    {"id": "eb8c255b-c7a9-4145-b0b8-2777fa1de738", "full_name": "Park Gahyun", "english_name": "Katie", "grade": "11"},
    {"id": "29993a12-33fb-44ce-96df-13350be23106", "full_name": "Seojin joug", "english_name": "Seojin", "grade": "11"},
    {"id": "5f10486c-bb85-43a5-bd19-e01615b64d6f", "full_name": "An, Yujun", "english_name": "Yujun", "grade": "12"},
    {"id": "16db0e33-0f68-40b8-9027-72e7818bdbdb", "full_name": "Jaehoon", "english_name": "Jaehoon", "grade": "12"},
    {"id": "0665fa71-f155-4090-833b-6b11a359ba58", "full_name": "Sean Park", "english_name": "Sean", "grade": "12"},
    {"id": "3740bcd9-9b8f-43be-ac71-002f16ab6c27", "full_name": "Song Sam Dong", "english_name": "Dennis", "grade": "12"},
]

def normalize_name(name):
    """Normalize name for comparison by removing special chars and lowercasing"""
    # Remove punctuation and extra whitespace
    normalized = re.sub(r'[,.]', '', name)
    normalized = re.sub(r'\s+', ' ', normalized).strip().lower()
    return normalized

def find_matches(masterlist, db_students):
    """Find matching students between masterlist and database"""

    matches = []
    name_mismatches = []
    not_in_db = []
    not_in_masterlist = []

    # Create lookup dictionaries
    db_by_english = {normalize_name(s['english_name']): s for s in db_students}
    db_by_full = {normalize_name(s['full_name']): s for s in db_students}

    masterlist_processed = set()

    for ml_student in masterlist:
        ml_english = normalize_name(ml_student['english_name'])
        ml_full = normalize_name(ml_student['full_name'])

        # Try to match by english name first
        db_match = db_by_english.get(ml_english) or db_by_full.get(ml_full)

        if db_match:
            masterlist_processed.add(normalize_name(db_match['english_name']))

            # Check if names match exactly
            if normalize_name(db_match['full_name']) != ml_full:
                name_mismatches.append({
                    'db_id': db_match['id'],
                    'db_full_name': db_match['full_name'],
                    'db_english_name': db_match['english_name'],
                    'ml_full_name': ml_student['full_name'],
                    'ml_english_name': ml_student['english_name'],
                    'ml_student_id': ml_student['student_id'],
                    'grade': ml_student['grade']
                })
            else:
                matches.append({
                    'db_id': db_match['id'],
                    'full_name': db_match['full_name'],
                    'english_name': db_match['english_name'],
                    'student_id': ml_student['student_id'],
                    'grade': ml_student['grade']
                })
        else:
            # Not found in database
            not_in_db.append(ml_student)

    # Find students in database but not in masterlist
    for db_student in db_students:
        db_english = normalize_name(db_student['english_name'])
        if db_english not in masterlist_processed:
            # Double check by full name
            db_full = normalize_name(db_student['full_name'])
            found = False
            for ml in masterlist:
                if normalize_name(ml['full_name']) == db_full or normalize_name(ml['english_name']) == db_english:
                    found = True
                    break
            if not found:
                not_in_masterlist.append(db_student)

    return matches, name_mismatches, not_in_db, not_in_masterlist

matches, name_mismatches, not_in_db, not_in_masterlist = find_matches(masterlist, db_students)

print(f"=== COMPARISON RESULTS ===\n")
print(f"Masterlist students (grades 6-12): {len(masterlist)}")
print(f"Database students (grades 6-12): {len(db_students)}")
print(f"\nExact matches: {len(matches)}")
print(f"Name mismatches (same person, different name format): {len(name_mismatches)}")
print(f"Students in masterlist but NOT in database: {len(not_in_db)}")
print(f"Students in database but NOT in masterlist: {len(not_in_masterlist)}")

print(f"\n=== NAME MISMATCHES (need to update) ===")
for i, mismatch in enumerate(name_mismatches, 1):
    print(f"{i}. Grade {mismatch['grade']} | ID: {mismatch['ml_student_id']}")
    print(f"   DB:  '{mismatch['db_full_name']}' / '{mismatch['db_english_name']}'")
    print(f"   ML:  '{mismatch['ml_full_name']}' / '{mismatch['ml_english_name']}'")
    print()

print(f"\n=== STUDENTS TO ADD (in masterlist, not in database) ===")
by_grade = {}
for student in not_in_db:
    if student['grade'] not in by_grade:
        by_grade[student['grade']] = []
    by_grade[student['grade']].append(student)

for grade in sorted(by_grade.keys(), key=lambda x: int(x)):
    print(f"\nGrade {grade} ({len(by_grade[grade])} students):")
    for student in by_grade[grade]:
        print(f"  - {student['full_name']} ({student['english_name']}) [ID: {student['student_id']}]")

print(f"\n=== STUDENTS IN DATABASE BUT NOT IN MASTERLIST ===")
print("(These might have already signed up with Google accounts)")
for student in not_in_masterlist:
    print(f"  - Grade {student['grade']}: {student['full_name']} ({student['english_name']})")

# Save results to JSON
results = {
    'matches': matches,
    'name_mismatches': name_mismatches,
    'not_in_db': not_in_db,
    'not_in_masterlist': not_in_masterlist
}

with open('comparison_results.json', 'w', encoding='utf-8') as f:
    json.dump(results, f, indent=2, ensure_ascii=False)

print(f"\n✓ Results saved to comparison_results.json")
