import re

# Parse the messy email list
email_text = """Gyuri Lim <gyuri.lim@stpaulclark.com>, Jooeun Park <jooeun.park@stpaulclark.com>, Minsung Kim <minsung.kim@stpaulclark.com>, Ayaan Verma <ayaan.verma@stpaulclark.com>, Myra Williams <myra@stpaulclark.com>, Rahee Park <rahee.park@stpaulclark.com>, Sia Park <sia.park@stpaulclark.com>, Sheen Bee Oh <sheenbee.oh@stpaulclark.com>, Vretchard Mateo <vretchard.mateo@stpaulclark.com>, Quang Bao Ma <quangbao.ma@stpaulclark.com>, Woojae Lee <woojae.lee@stpaulclark.com>, Seokwoo Hong <seokwoo.hong@stpaulclark.com>, Soojeong Diaz Cho <soojeong.cho@stpaulclark.com>, Woo Hyun Ko <woohyun@stpaulclark.com>, Seryn Kyung <seryn.kyung@stpaulclark.com>, Gabriel Albrecht <gabriel.albrecht@stpaulclark.com>, Li-An Tseng <lian.tseng@stpaulclark.com>, Yxabella Aldana <yxabella.aldana@stpaulclark.com>, Chi-Wen Wang <chi-wen.wang@stpaulclark.com>, Camry Tobias <camry.tobias@stpaulclark.com>, Jacob Leejun Park <jacob.leejun@stpaulclark.com>, Jiyeon Song <jiyeon.song@stpaulclark.com>, Biya Shin <biya@stpaulclark.com>, Ju Won Park <juwon.park@stpaulclark.com>, Eliana Saburdo <eliana.saburdo@stpaulclark.com>, Nayeong Lee <nayeongl@stpaulclark.com>, Suryn Kyung <suryn.kyung@stpaulclark.com>, Chrystelle Magat <chrystelle.magat@stpaulclark.com>, Jeongwon Lee <jeongwon.lee@stpaulclark.com>, Kyu Hyeon Kim <kyuhyeon.kim@stpaulclark.com>, Huije Kim <huije.kim@stpaulclark.com>, Cataleyna Sophia Headley <sophia.headley@stpaulclark.com>, Seokju Hong <seokju.hong@stpaulclark.com>, Macy Corpuz <macy.corpuz@stpaulclark.com>, Sanghyuk Go <sanghyukg@stpaulclark.com>, Jiung Choi <jiung.choi@stpaulclark.com>, Erika Dedil <erika.dedil@stpaulclark.com>, Yeonkyu Cho <yeonkyu.cho@stpaulclark.com>, Adi Chopra <adi.chopra@stpaulclark.com>, Seo Woo Chang <seowoo.chang@stpaulclark.com>, Irene Obregon <irene.obregon@stpaulclark.com>, Jaewoong Yoon <jaewoong.yoon@stpaulclark.com>, Sua An <sua.an@stpaulclark.com>, Aryanna Wegner <aryanna.wegner@stpaulclark.com>, "Jon Jacob D. Smith" <jonjacob.smith@stpaulclark.com>, Gel Emrie Stanley <gel.stanley@stpaulclark.com>, Alexandra Saburdo <alexandra.saburdo@stpaulclark.com>, Seong Yun Seo <seongyun.seo@stpaulclark.com>, Leah Park <leah.park@stpaulclark.com>, Jazlynne Ong <jazlynne.ong@stpaulclark.com>, Azra Lumbu-An <azral@stpaulclark.com>, Jayrielle Miriam Mirasol <jayrielle.mirasol@stpaulclark.com>, Ryan Agustin Lee <ryan.lee@stpaulclark.com>, Jeongmo Lee <jeongmo.lee@stpaulclark.com>, Halin Lee <halin.lee@stpaulclark.com>, Taegeon Kim <taegeon.kim@stpaulclark.com>, Hyeyun Kim <hyeyun.kim@stpaulclark.com>, Sihyun Kwon <lowell.kwon@stpaulclark.com>, Seunghu kim <seunghu.kim@stpaulclark.com>, Ga-On Kim <gaon.kim@stpaulclark.com>, Ryukeon Kang <ryukeon.kang@stpaulclark.com>, Timothy Jefferson Dayrit <timothyjeff.dayrit@stpaulclark.com>, Benjamin Jake Garland <benjamin.garland@stpaulclark.com>, Hyunyoung Jeong <hyunyoung.jeong@stpaulclark.com>, Sunyou Choi <sunyou.choi@stpaulclark.com>, Alliah Bonoyer <alliah.bonoyer@stpaulclark.com>, Logan Corkery <logan.corkery@stpaulclark.com>, Hao-Ming Wang <hao-ming.wang@stpaulclark.com>, Daeun Lee <daeunlee@stpaulclark.com>, Seokyung Joo <seokyung.joo@stpaulclark.com>, Rahee Jang <rahee.jang@stpaulclark.com>, Chloe Liz Adarlo <chloeliz.adarlo@stpaulclark.com>, Seoyoon Chang <seoyoonchang@stpaulclark.com>, Jiyoo Choi <jiyoo.choi@stpaulclark.com>, Seoyeong Yu <seoyeong.yu@stpaulclark.com>, Kendra Zaicek <kendra.zaicek@stpaulclark.com>, Ngoc Han Tran <ngochan.tran@stpaulclark.com>, Taewoong Yoon <taewoong.yoon@stpaulclark.com>, Jeongwoo Seo <jeongwoo.seo@stpaulclark.com>, Serin Park <serin.park@stpaulclark.com>, Ayeong Son <ayeong.son@stpaulclark.com>, Subhin Oh <subhin.oh@stpaulclark.com>, Seoyeon Park <seoyeon.park@stpaulclark.com>, Manuel Nablo Jr <manuel.nablo@stpaulclark.com>, Jonathan Lerio <jonathan.lerio@stpaulclark.com>, Jasmine Kelly Line <jasmine.line@stpaulclark.com>, Cyruz Papango <cyruz.papango@stpaulclark.com>, Jhihyun Li <jhihyun.li@stpaulclark.com>, Seungwon Lee <seungwon.lee@stpaulclark.com>, You Eun Kim <you-eun.kim@stpaulclark.com>, Dayeon Lee <dayeon.lee@stpaulclark.com>, Sieun Kwon <emily.kwon@stpaulclark.com>, Woo Jin Ko <woojin@stpaulclark.com>, Shiyu Huang <shiyuhuang@stpaulclark.com>, Shinwook Kim <shinwook@stpaulclark.com>, Riwon Kim <riwon.kim9@stpaulclark.com>, Michael Edward Hickey <michael.hickey@stpaulclark.com>, Hyongju Hong <ju.hong@stpaulclark.com>, Timo Frey <timo.frey@stpaulclark.com>, Sophia Corpuz <sophia.corpuz@stpaulclark.com>, John Ignacio Nash Cruz <nash.cruz@stpaulclark.com>, Mara-Alexandria Sarinas <mara.sarinas@stpaulclark.com>, Taehoon Ha <taehoonha@stpaulclark.com>, Anir Annie Altangerel <annie.altangerel@stpaulclark.com>, Jaein Ahn <jaein.ahn@stpaulclark.com>, Jaehyun Choi <jaehyun.choi@stpaulclark.com>, Yunseo Park <yunseo.park@stpaulclark.com>, jiwon park <jiwon.park@stpaulclark.com>, Seungmin Lee <seungminlee@stpaulclark.com>, Angel Mustafa <angelica.mustafa@stpaulclark.com>, Byeong Jun Park <byeongjun.park@stpaulclark.com>, Heemin Kwon <heeminkwon@stpaulclark.com>, Bat- Ochir Odmandakh <bat-ochir.odmandakh@stpaulclark.com>, Czyrel Marzan <czyrel.marzan@stpaulclark.com>, John Marcial Mirasol <john.mirasol@stpaulclark.com>, Naeun Lee <naeun.lee@stpaulclark.com>, Haon Lee <haon.lee@stpaulclark.com>, Du Tommy <du.tommy@stpaulclark.com>, Yijoon Kim <yijoon@stpaulclark.com>, Jaehoon Sohn <jaehoon.sohn@stpaulclark.com>, Dohee Kwon <dohee.kwon@stpaulclark.com>, Seojin Joug <seojinj@stpaulclark.com>, Sean Park <seanp@stpaulclark.com>, Seojun Joug <seojunj@stpaulclark.com>, Luigi Marco Yapjoco <luigi.yapjoco@stpaulclark.com>, Jinseo Park <jinseop@stpaulclark.com>, Bryan Hong <bryanh@stpaulclark.com>, Jiyeon Go <jiyeong@stpaulclark.com>, Soyeon Lee <soyeon@stpaulclark.com>, Siyue Chen <kevin.chen@stpaulclark.com>, Sean Lee <seanl@stpaulclark.com>, Christian Dylan Quiambao David <christiandavid@stpaulclark.com>, Minjun Kim <jun.kim@stpaulclark.com>, Yujun An <yujun.an@stpaulclark.com>, Sion Kwon <jessica.kwon@stpaulclark.com>, Jueun Lee <jueun.lee@stpaulclark.com>, Kyuri Kim <kyuri.kim@stpaulclark.com>, Juho Lee <juho@stpaulclark.com>, Gahyun Park <gahyun.park@stpaulclark.com>, Phuoc Nhan Bui <phuoc.bui@stpaulclark.com>, gia.nguyen@stpaulclark.com"""

# Extract emails using regex
pattern = r'<([^>]+)>|(\S+@\S+)'
emails = []
for match in re.finditer(pattern, email_text):
    email = match.group(1) or match.group(2)
    if email and '@' in email:
        emails.append(email.strip())

# Manual mapping based on the database student names
student_email_map = {
    # Grade 6
    'Gabriel Alexander Albrecht': 'gabriel.albrecht@stpaulclark.com',
    'Yxabella Aldana': 'yxabella.aldana@stpaulclark.com',
    'Soojeong Diaz Cho': 'soojeong.cho@stpaulclark.com',
    'Seokwoo Hong': 'seokwoo.hong@stpaulclark.com',
    'Woohyun Ko': 'woohyun@stpaulclark.com',
    'Seryn Kyung': 'seryn.kyung@stpaulclark.com',
    'Woojae Lee': 'woojae.lee@stpaulclark.com',
    'Quang Bao Ma': 'quangbao.ma@stpaulclark.com',
    'Vhretchard Mateo': 'vretchard.mateo@stpaulclark.com',
    'Sheenbee Oh': 'sheenbee.oh@stpaulclark.com',
    'Rahee Park': 'rahee.park@stpaulclark.com',
    'Sia Park': 'sia.park@stpaulclark.com',
    'Ayaan Verma': 'ayaan.verma@stpaulclark.com',
    'Myra James Williams': 'myra@stpaulclark.com',

    # Grade 7
    'Sua An': 'sua.an@stpaulclark.com',
    'Seowoo Chang': 'seowoo.chang@stpaulclark.com',
    'Jiung Choi': 'jiung.choi@stpaulclark.com',
    'Adi Chopra': 'adi.chopra@stpaulclark.com',
    'Macy Margaux Corpuz': 'macy.corpuz@stpaulclark.com',
    'Erika Amor Dedil': 'erika.dedil@stpaulclark.com',
    'Sanghyuk Go': 'sanghyukg@stpaulclark.com',
    'Cataleyna Sophia Headley': 'sophia.headley@stpaulclark.com',
    'Seokju Hong': 'seokju.hong@stpaulclark.com',
    'Kyuhyeon Kim': 'kyuhyeon.kim@stpaulclark.com',
    'Huije Kim': 'huije.kim@stpaulclark.com',
    'Suryn Kyung': 'suryn.kyung@stpaulclark.com',
    'Nayeong Lee': 'nayeongl@stpaulclark.com',
    'Jeongwon Lee': 'jeongwon.lee@stpaulclark.com',
    'Chrystelle Magat': 'chrystelle.magat@stpaulclark.com',
    'Jacob Leejun Park': 'jacob.leejun@stpaulclark.com',
    'Juwon Park': 'juwon.park@stpaulclark.com',
    'Eliana Saburdo': 'eliana.saburdo@stpaulclark.com',
    'Biya Shin': 'biya@stpaulclark.com',
    'Jiyeon Song': 'jiyeon.song@stpaulclark.com',
    'Camry Tobias': 'camry.tobias@stpaulclark.com',
    'Li-An Tseng': 'lian.tseng@stpaulclark.com',
    'Chi-Wen Wang': 'chi-wen.wang@stpaulclark.com',

    # Grade 8
    'Alliah Michelle Bonoyer': 'alliah.bonoyer@stpaulclark.com',
    'Irene Caminero Obregon': 'irene.obregon@stpaulclark.com',
    'Logan Maurice Corkery': 'logan.corkery@stpaulclark.com',
    'Yeonkyu Cho': 'yeonkyu.cho@stpaulclark.com',
    'Sunyou Choi': 'sunyou.choi@stpaulclark.com',
    'Timothy Jefferson Dayrit': 'timothyjeff.dayrit@stpaulclark.com',
    'Benjamin Jake Osabel Garland': 'benjamin.garland@stpaulclark.com',
    'Hyunyoung Jeong': 'hyunyoung.jeong@stpaulclark.com',
    'Ryukeon Kang': 'ryukeon.kang@stpaulclark.com',
    'Ga-on Kim': 'gaon.kim@stpaulclark.com',
    'Hyeyun Kim': 'hyeyun.kim@stpaulclark.com',
    'Kyuri Kim': 'kyuri.kim@stpaulclark.com',
    'Taegeon Kim': 'taegeon.kim@stpaulclark.com',
    'Seunghu Kim': 'seunghu.kim@stpaulclark.com',
    'Sihyun Kwon': 'lowell.kwon@stpaulclark.com',
    'Halin Lee': 'halin.lee@stpaulclark.com',
    'Jeongmo Lee': 'jeongmo.lee@stpaulclark.com',
    'Ryan Agustin Lee': 'ryan.lee@stpaulclark.com',
    'Azra Nez Gabrielle Perez Lumbu-an': 'azral@stpaulclark.com',
    'Jayrielle Miriam Mirasol': 'jayrielle.mirasol@stpaulclark.com',
    'Jazlynne Nina Ong': 'jazlynne.ong@stpaulclark.com',
    'Leah Park': 'leah.park@stpaulclark.com',
    'Alexandra Saburdo': 'alexandra.saburdo@stpaulclark.com',
    'Seongyun Seo': 'seongyun.seo@stpaulclark.com',
    'Jon Jacob Dayrit Smith': 'jonjacob.smith@stpaulclark.com',
    'Gel Emrie Pedrito Stanley': 'gel.stanley@stpaulclark.com',
    'Aryanna Destiny Portugaliza Wegner': 'aryanna.wegner@stpaulclark.com',
    'Jaewoong Yoon': 'jaewoong.yoon@stpaulclark.com',
    'Jueun Lee': 'jueun.lee@stpaulclark.com',

    # Grade 9
    'Chloe Liz Adarlo': 'chloeliz.adarlo@stpaulclark.com',
    'Seoyoon Chang': 'seoyoonchang@stpaulclark.com',
    'Jiyoo Choi': 'jiyoo.choi@stpaulclark.com',
    'Ayra Mari Dantis': None,  # Not in email list
    'Rahee Jang': 'rahee.jang@stpaulclark.com',
    'Seokyung Joo': 'seokyung.joo@stpaulclark.com',
    'Minsung Kim': 'minsung.kim@stpaulclark.com',
    'Daeun Lee': 'daeunlee@stpaulclark.com',
    'Gyuri Lim': 'gyuri.lim@stpaulclark.com',
    'Hao-Ming Wang': 'hao-ming.wang@stpaulclark.com',

    # Grade 10
    'Jaein Ahn': 'jaein.ahn@stpaulclark.com',
    'Anir Altangerel': 'annie.altangerel@stpaulclark.com',
    'Jaehyun Choi': 'jaehyun.choi@stpaulclark.com',
    'Sophia Juanita Noreve Corpuz': 'sophia.corpuz@stpaulclark.com',
    'John Ignacio Pamintuan Cruz': 'nash.cruz@stpaulclark.com',
    'Timo Wendelin Frey': 'timo.frey@stpaulclark.com',
    'Taehoon Ha': 'taehoonha@stpaulclark.com',
    'Michael Edward Hickey': 'michael.hickey@stpaulclark.com',
    'Hyongju Hong': 'ju.hong@stpaulclark.com',
    'Shiyu Huang': 'shiyuhuang@stpaulclark.com',
    'Youeun Kim': 'you-eun.kim@stpaulclark.com',
    'Riwon Kim': 'riwon.kim9@stpaulclark.com',
    'Shinwook Kim': 'shinwook@stpaulclark.com',
    'Woojin Ko': 'woojin@stpaulclark.com',
    'Sieun Kwon': 'emily.kwon@stpaulclark.com',
    'Dayeon Lee': 'dayeon.lee@stpaulclark.com',
    'Seungwon Lee': 'seungwon.lee@stpaulclark.com',
    'Jonathan Michael Lerio': 'jonathan.lerio@stpaulclark.com',
    'Jhih-Yun Li': 'jhihyun.li@stpaulclark.com',
    'Jasmine Kelly Line': 'jasmine.line@stpaulclark.com',
    'Manuel Nablo Jr.': 'manuel.nablo@stpaulclark.com',
    'Subhin Oh': 'subhin.oh@stpaulclark.com',
    'Cyrus Dave Papango': 'cyruz.papango@stpaulclark.com',
    'Jooeun Park': 'jooeun.park@stpaulclark.com',
    'Seoyeon Park': 'seoyeon.park@stpaulclark.com',
    'Serin Park': 'serin.park@stpaulclark.com',
    'Jeongwoo Seo': 'jeongwoo.seo@stpaulclark.com',
    'Ayeong Son': 'ayeong.son@stpaulclark.com',
    'Ngoc Han Tran': 'ngochan.tran@stpaulclark.com',
    'Taewoong Yoon': 'taewoong.yoon@stpaulclark.com',
    'Seoyeong Yu': 'seoyeong.yu@stpaulclark.com',
    'Kendra Jeanelle Zaicek': 'kendra.zaicek@stpaulclark.com',

    # Grade 11
    'Phuoc Nhan Bui': 'phuoc.bui@stpaulclark.com',
    'Tommy Du': 'du.tommy@stpaulclark.com',
    'Seojin Joug': 'seojinj@stpaulclark.com',
    'Seojun Joug': 'seojunj@stpaulclark.com',
    'Yijoon Kim': 'yijoon@stpaulclark.com',
    'Dohee Kwon': 'dohee.kwon@stpaulclark.com',
    'Heemin Kwon': 'heeminkwon@stpaulclark.com',
    'Haon Lee': 'haon.lee@stpaulclark.com',
    'Naeun Lee': 'naeun.lee@stpaulclark.com',
    'Seungmin Lee': 'seungminlee@stpaulclark.com',
    'Czyrel Marzan': 'czyrel.marzan@stpaulclark.com',
    'John Marcial Mirasol': 'john.mirasol@stpaulclark.com',
    'Precious Angelica Mustafa': 'angelica.mustafa@stpaulclark.com',
    'Bat-Ochir Odmandakh': 'bat-ochir.odmandakh@stpaulclark.com',
    'Byeongjun Park': 'byeongjun.park@stpaulclark.com',
    'Gahyun Park': 'gahyun.park@stpaulclark.com',
    'Jiwon Park': 'jiwon.park@stpaulclark.com',
    'Yunseo Park': 'yunseo.park@stpaulclark.com',
    'Mara-Alexandria Cortes Sarinas': 'mara.sarinas@stpaulclark.com',

    # Grade 12
    'Yujun An': 'yujun.an@stpaulclark.com',
    'Siyue Chen': 'kevin.chen@stpaulclark.com',
    'Christian Dylan Quiambao David': 'christiandavid@stpaulclark.com',
    'Jiyeon Go': 'jiyeong@stpaulclark.com',
    'Seungju Hong': 'bryanh@stpaulclark.com',
    'Minjun Kim': 'jun.kim@stpaulclark.com',
    'Sion Kwon': 'jessica.kwon@stpaulclark.com',
    'Sean Lee': 'seanl@stpaulclark.com',
    'Soyeon Lee': 'soyeon@stpaulclark.com',
    'Sieon Park': 'seanp@stpaulclark.com',
    'Jinseo Park': 'jinseop@stpaulclark.com',
    'Jaehoon Sohn': 'jaehoon.sohn@stpaulclark.com',
    'Luigi Marco Yapjoco': 'luigi.yapjoco@stpaulclark.com',
    'Nguyen Gia Bao': 'gia.nguyen@stpaulclark.com',
}

# Generate SQL for student email updates
sql_statements = []
sql_statements.append("-- Update student emails")

for student_name, email in student_email_map.items():
    if email:
        escaped_name = student_name.replace("'", "''")
        sql_statements.append(f"UPDATE students SET email = '{email}' WHERE full_name = '{escaped_name}';")

# Generate SQL for teachers
teachers = [
    ('Yna Kristina Dela Cruz', 'delacruz@stpaulclark.com'),
    ('Alyanna Carlos', 'alyannac@stpaulclark.com'),
    ('Beverly Carino', 'beverly.carino@stpaulclark.com'),
    ('Crystal Layug', 'crystall@stpaulclark.com'),
    ('Dennis Alimpolos', 'dennis.alimpolos@stpaulclark.com'),
    ('Garrett Anderson', 'garrett.anderson@stpaulclark.com'),
    ('Jeo Cruz', 'jeo.cruz@stpaulclark.com'),
    ('Kristine Ann Pangan', 'kristineann.pangan@stpaulclark.com'),
    ('Mariedelle Turla', 'mariedelle@stpaulclark.com'),
    ('Meryl Joy T Alcayro', 'mj.alcayro@stpaulclark.com'),
    ('Michael Barredo', 'michael.barredo@stpaulclark.com'),
    ('Nicholas Smith', 'smith.nj@stpaulclark.com'),
    ('Ryan Dloski', 'ryan.dloski@stpaulclark.com'),
    ('Sebastian Maria Verdugo Pedrero', 'sebastian@stpaulclark.com'),
    ('Stephen Ward', 'stephenw@stpaulclark.com'),
    ('Syrha Faustino', 'syrha.faustino@stpaulclark.com'),
    ('Vicky Jeong', 'vicky.jeong@stpaulclark.com'),
    ('Yubo Chen', 'yubo.chen@stpaulclark.com'),
]

sql_statements.append("\n-- Add teachers")
for name, email in teachers:
    sql_statements.append(f"INSERT INTO teachers (name, email) VALUES ('{name}', '{email}');")

# Add principal
sql_statements.append("\n-- Add principal account")
sql_statements.append("INSERT INTO students (full_name, english_name, email, grade) VALUES ('Dennis Principal', 'Dennis', 'imdennisalimpolos@gmail.com', '12');")

with open('add_emails_and_teachers.sql', 'w', encoding='utf-8') as f:
    f.write('\n'.join(sql_statements))

print("Generated SQL file: add_emails_and_teachers.sql")
print(f"Student emails mapped: {len([e for e in student_email_map.values() if e])}")
print(f"Teachers to add: {len(teachers)}")
print("Principal account: Dennis Principal")
