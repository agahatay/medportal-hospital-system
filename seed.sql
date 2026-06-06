-- ============================================================
-- Hospital Appointment System — Seed Data
-- Şema: migration.sql çalıştırıldıktan sonra bu dosyayı çalıştır.
-- Şifre: 123456 (bcrypt hash)
-- ============================================================

USE hospital_db;

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE RadiologicalResults;
TRUNCATE TABLE Prescriptions;
TRUNCATE TABLE Billing;
TRUNCATE TABLE MedicalRecords;
TRUNCATE TABLE Medications;
TRUNCATE TABLE doctor_schedules;
TRUNCATE TABLE Doctor_Departments;
TRUNCATE TABLE Appointments;
TRUNCATE TABLE Doctors;
TRUNCATE TABLE Patients;
TRUNCATE TABLE Departments;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;

SET @hash = '$2b$10$ZUT1GRjYF8IbUaRDKoGcoODmn4eXXqqNRRDVECg5/pZV9sQoZV3VO';

-- ============================================================
-- USERS (60 rows: 10 ADMIN, 20 DOCTOR, 30 PATIENT)
-- ============================================================
INSERT INTO users (id, email, password, role, created_at) VALUES
-- ADMIN (1-10)
(1,  'admin01@test.com', @hash, 'ADMIN',   '2025-01-01 09:00:00'),
(2,  'admin02@test.com', @hash, 'ADMIN',   '2025-01-01 09:00:00'),
(3,  'admin03@test.com', @hash, 'ADMIN',   '2025-01-01 09:00:00'),
(4,  'admin04@test.com', @hash, 'ADMIN',   '2025-01-01 09:00:00'),
(5,  'admin05@test.com', @hash, 'ADMIN',   '2025-01-01 09:00:00'),
(6,  'admin06@test.com', @hash, 'ADMIN',   '2025-01-01 09:00:00'),
(7,  'admin07@test.com', @hash, 'ADMIN',   '2025-01-01 09:00:00'),
(8,  'admin08@test.com', @hash, 'ADMIN',   '2025-01-01 09:00:00'),
(9,  'admin09@test.com', @hash, 'ADMIN',   '2025-01-01 09:00:00'),
(10, 'admin10@test.com', @hash, 'ADMIN',   '2025-01-01 09:00:00'),
-- DOCTOR (11-30)
(11, 'doctor01@test.com', @hash, 'DOCTOR', '2025-01-02 09:00:00'),
(12, 'doctor02@test.com', @hash, 'DOCTOR', '2025-01-02 09:00:00'),
(13, 'doctor03@test.com', @hash, 'DOCTOR', '2025-01-02 09:00:00'),
(14, 'doctor04@test.com', @hash, 'DOCTOR', '2025-01-02 09:00:00'),
(15, 'doctor05@test.com', @hash, 'DOCTOR', '2025-01-02 09:00:00'),
(16, 'doctor06@test.com', @hash, 'DOCTOR', '2025-01-02 09:00:00'),
(17, 'doctor07@test.com', @hash, 'DOCTOR', '2025-01-02 09:00:00'),
(18, 'doctor08@test.com', @hash, 'DOCTOR', '2025-01-02 09:00:00'),
(19, 'doctor09@test.com', @hash, 'DOCTOR', '2025-01-02 09:00:00'),
(20, 'doctor10@test.com', @hash, 'DOCTOR', '2025-01-02 09:00:00'),
(21, 'doctor11@test.com', @hash, 'DOCTOR', '2025-01-02 09:00:00'),
(22, 'doctor12@test.com', @hash, 'DOCTOR', '2025-01-02 09:00:00'),
(23, 'doctor13@test.com', @hash, 'DOCTOR', '2025-01-02 09:00:00'),
(24, 'doctor14@test.com', @hash, 'DOCTOR', '2025-01-02 09:00:00'),
(25, 'doctor15@test.com', @hash, 'DOCTOR', '2025-01-02 09:00:00'),
(26, 'doctor16@test.com', @hash, 'DOCTOR', '2025-01-02 09:00:00'),
(27, 'doctor17@test.com', @hash, 'DOCTOR', '2025-01-02 09:00:00'),
(28, 'doctor18@test.com', @hash, 'DOCTOR', '2025-01-02 09:00:00'),
(29, 'doctor19@test.com', @hash, 'DOCTOR', '2025-01-02 09:00:00'),
(30, 'doctor20@test.com', @hash, 'DOCTOR', '2025-01-02 09:00:00'),
-- PATIENT (31-60)
(31, 'patient01@test.com', @hash, 'PATIENT', '2025-01-03 09:00:00'),
(32, 'patient02@test.com', @hash, 'PATIENT', '2025-01-03 09:00:00'),
(33, 'patient03@test.com', @hash, 'PATIENT', '2025-01-03 09:00:00'),
(34, 'patient04@test.com', @hash, 'PATIENT', '2025-01-03 09:00:00'),
(35, 'patient05@test.com', @hash, 'PATIENT', '2025-01-03 09:00:00'),
(36, 'patient06@test.com', @hash, 'PATIENT', '2025-01-03 09:00:00'),
(37, 'patient07@test.com', @hash, 'PATIENT', '2025-01-03 09:00:00'),
(38, 'patient08@test.com', @hash, 'PATIENT', '2025-01-03 09:00:00'),
(39, 'patient09@test.com', @hash, 'PATIENT', '2025-01-03 09:00:00'),
(40, 'patient10@test.com', @hash, 'PATIENT', '2025-01-03 09:00:00'),
(41, 'patient11@test.com', @hash, 'PATIENT', '2025-01-03 09:00:00'),
(42, 'patient12@test.com', @hash, 'PATIENT', '2025-01-03 09:00:00'),
(43, 'patient13@test.com', @hash, 'PATIENT', '2025-01-03 09:00:00'),
(44, 'patient14@test.com', @hash, 'PATIENT', '2025-01-03 09:00:00'),
(45, 'patient15@test.com', @hash, 'PATIENT', '2025-01-03 09:00:00'),
(46, 'patient16@test.com', @hash, 'PATIENT', '2025-01-03 09:00:00'),
(47, 'patient17@test.com', @hash, 'PATIENT', '2025-01-03 09:00:00'),
(48, 'patient18@test.com', @hash, 'PATIENT', '2025-01-03 09:00:00'),
(49, 'patient19@test.com', @hash, 'PATIENT', '2025-01-03 09:00:00'),
(50, 'patient20@test.com', @hash, 'PATIENT', '2025-01-03 09:00:00'),
(51, 'patient21@test.com', @hash, 'PATIENT', '2025-01-03 09:00:00'),
(52, 'patient22@test.com', @hash, 'PATIENT', '2025-01-03 09:00:00'),
(53, 'patient23@test.com', @hash, 'PATIENT', '2025-01-03 09:00:00'),
(54, 'patient24@test.com', @hash, 'PATIENT', '2025-01-03 09:00:00'),
(55, 'patient25@test.com', @hash, 'PATIENT', '2025-01-03 09:00:00'),
(56, 'patient26@test.com', @hash, 'PATIENT', '2025-01-03 09:00:00'),
(57, 'patient27@test.com', @hash, 'PATIENT', '2025-01-03 09:00:00'),
(58, 'patient28@test.com', @hash, 'PATIENT', '2025-01-03 09:00:00'),
(59, 'patient29@test.com', @hash, 'PATIENT', '2025-01-03 09:00:00'),
(60, 'patient30@test.com', @hash, 'PATIENT', '2025-01-03 09:00:00');

-- ============================================================
-- DEPARTMENTS (20 rows)
-- ============================================================
INSERT INTO Departments (department_id, name, location, created_at) VALUES
(1,  'Cardiology',                 'Floor 1',      '2025-01-01 08:00:00'),
(2,  'Neurology',                  'Floor 2',      '2025-01-01 08:00:00'),
(3,  'Orthopedics',                'Floor 3',      '2025-01-01 08:00:00'),
(4,  'Pediatrics',                 'Floor 4',      '2025-01-01 08:00:00'),
(5,  'Dermatology',                'Floor 5',      '2025-01-01 08:00:00'),
(6,  'Ophthalmology',              'Floor 6',      '2025-01-01 08:00:00'),
(7,  'ENT',                        'Floor 2',      '2025-01-01 08:00:00'),
(8,  'Gastroenterology',           'Floor 3',      '2025-01-01 08:00:00'),
(9,  'Pulmonology',                'Floor 4',      '2025-01-01 08:00:00'),
(10, 'Urology',                    'Floor 5',      '2025-01-01 08:00:00'),
(11, 'Psychiatry',                 'Floor 6',      '2025-01-01 08:00:00'),
(12, 'Oncology',                   'Floor 7',      '2025-01-01 08:00:00'),
(13, 'Endocrinology',              'Floor 3',      '2025-01-01 08:00:00'),
(14, 'Rheumatology',               'Floor 4',      '2025-01-01 08:00:00'),
(15, 'Nephrology',                 'Floor 5',      '2025-01-01 08:00:00'),
(16, 'Hematology',                 'Floor 6',      '2025-01-01 08:00:00'),
(17, 'Infectious Diseases',        'Floor 2',      '2025-01-01 08:00:00'),
(18, 'General Surgery',            'Floor 1',      '2025-01-01 08:00:00'),
(19, 'Obstetrics and Gynecology',  'Floor 3',      '2025-01-01 08:00:00'),
(20, 'Physical Therapy',           'Ground Floor', '2025-01-01 08:00:00');

-- ============================================================
-- PATIENTS (30 rows) — user_id 31-60
-- ============================================================
INSERT INTO Patients (patient_id, user_id, first_name, last_name, date_of_birth, gender, phone, email, address, created_at) VALUES
(1,  31, 'Ahmet',   'Yılmaz',    '1985-03-15', 'Male',   '+90 532 111 0001', 'patient01@test.com', 'Kadıköy, İstanbul',      '2025-01-03 09:00:00'),
(2,  32, 'Elif',    'Kaya',      '1990-07-22', 'Female', '+90 533 111 0002', 'patient02@test.com', 'Çankaya, Ankara',         '2025-01-03 09:00:00'),
(3,  33, 'Mehmet',  'Demir',     '1978-11-08', 'Male',   '+90 534 111 0003', 'patient03@test.com', 'Bornova, İzmir',          '2025-01-03 09:00:00'),
(4,  34, 'Zeynep',  'Öztürk',   '1995-01-30', 'Female', '+90 535 111 0004', 'patient04@test.com', 'Nilüfer, Bursa',          '2025-01-03 09:00:00'),
(5,  35, 'Mustafa', 'Şahin',    '1982-06-12', 'Male',   '+90 536 111 0005', 'patient05@test.com', 'Seyhan, Adana',           '2025-01-03 09:00:00'),
(6,  36, 'Fatma',   'Arslan',    '1988-09-25', 'Female', '+90 537 111 0006', 'patient06@test.com', 'Muratpaşa, Antalya',     '2025-01-03 09:00:00'),
(7,  37, 'Ali',     'Çelik',    '1975-04-18', 'Male',   '+90 538 111 0007', 'patient07@test.com', 'Atakum, Samsun',          '2025-01-03 09:00:00'),
(8,  38, 'Ayşe',   'Koç',       '1992-12-05', 'Female', '+90 539 111 0008', 'patient08@test.com', 'Meram, Konya',            '2025-01-03 09:00:00'),
(9,  39, 'Hasan',   'Yıldız',   '1980-02-28', 'Male',   '+90 540 111 0009', 'patient09@test.com', 'Odunpazarı, Eskişehir', '2025-01-03 09:00:00'),
(10, 40, 'Merve',   'Aydın',    '1997-08-14', 'Female', '+90 541 111 0010', 'patient10@test.com', 'Yıldırım, Bursa',        '2025-01-03 09:00:00'),
(11, 41, 'Emre',    'Erdoğan',  '1983-05-20', 'Male',   '+90 542 111 0011', 'patient11@test.com', 'Beşiktaş, İstanbul',     '2025-01-03 09:00:00'),
(12, 42, 'Selin',   'Güneş',    '1991-10-03', 'Female', '+90 543 111 0012', 'patient12@test.com', 'Mamak, Ankara',           '2025-01-03 09:00:00'),
(13, 43, 'Burak',   'Özdemir',  '1976-07-16', 'Male',   '+90 544 111 0013', 'patient13@test.com', 'Karşıyaka, İzmir',       '2025-01-03 09:00:00'),
(14, 44, 'Deniz',   'Aksoy',     '1994-03-09', 'Female', '+90 545 111 0014', 'patient14@test.com', 'Osmangazi, Bursa',        '2025-01-03 09:00:00'),
(15, 45, 'Oğuz',   'Polat',     '1987-11-22', 'Male',   '+90 546 111 0015', 'patient15@test.com', 'Yüreğir, Adana',         '2025-01-03 09:00:00'),
(16, 46, 'Ceren',   'Korkmaz',   '1999-06-07', 'Female', '+90 547 111 0016', 'patient16@test.com', 'Kepez, Antalya',          '2025-01-03 09:00:00'),
(17, 47, 'Serkan',  'Özkan',    '1981-01-25', 'Male',   '+90 548 111 0017', 'patient17@test.com', 'İlkadım, Samsun',        '2025-01-03 09:00:00'),
(18, 48, 'Gizem',   'Kılıç',   '1993-09-11', 'Female', '+90 549 111 0018', 'patient18@test.com', 'Selçuklu, Konya',        '2025-01-03 09:00:00'),
(19, 49, 'Cem',     'Tekin',     '1979-04-04', 'Male',   '+90 550 111 0019', 'patient19@test.com', 'Tepebaşı, Eskişehir',   '2025-01-03 09:00:00'),
(20, 50, 'Pınar',  'Doğan',    '1996-12-19', 'Female', '+90 551 111 0020', 'patient20@test.com', 'Üsküdar, İstanbul',      '2025-01-03 09:00:00'),
(21, 51, 'Barış',  'Çetin',    '1984-08-03', 'Male',   '+90 552 111 0021', 'patient21@test.com', 'Etimesgut, Ankara',       '2025-01-03 09:00:00'),
(22, 52, 'Esra',    'Yılmaz',   '1989-02-17', 'Female', '+90 553 111 0022', 'patient22@test.com', 'Konak, İzmir',            '2025-01-03 09:00:00'),
(23, 53, 'Tolga',   'Şen',      '1977-06-29', 'Male',   '+90 554 111 0023', 'patient23@test.com', 'Gebze, Kocaeli',          '2025-01-03 09:00:00'),
(24, 54, 'Naz',     'Karaca',    '1998-11-11', 'Female', '+90 555 111 0024', 'patient24@test.com', 'Mezitli, Mersin',         '2025-01-03 09:00:00'),
(25, 55, 'Kaan',    'Aslan',     '1986-03-08', 'Male',   '+90 556 111 0025', 'patient25@test.com', 'Pamukkale, Denizli',      '2025-01-03 09:00:00'),
(26, 56, 'Yasemin', 'Koç',      '1992-07-21', 'Female', '+90 557 111 0026', 'patient26@test.com', 'Osmangazi, Bursa',        '2025-01-03 09:00:00'),
(27, 57, 'Uğur',   'Demirtaş', '1980-12-14', 'Male',   '+90 558 111 0027', 'patient27@test.com', 'Keçiören, Ankara',       '2025-01-03 09:00:00'),
(28, 58, 'Tuğba',  'Eren',      '1995-05-26', 'Female', '+90 559 111 0028', 'patient28@test.com', 'Şişli, İstanbul',        '2025-01-03 09:00:00'),
(29, 59, 'Onur',    'Kara',      '1983-09-18', 'Male',   '+90 560 111 0029', 'patient29@test.com', 'Çiğli, İzmir',           '2025-01-03 09:00:00'),
(30, 60, 'Büşra',  'Altın',    '1991-01-05', 'Female', '+90 561 111 0030', 'patient30@test.com', 'Tarsus, Mersin',          '2025-01-03 09:00:00');

-- ============================================================
-- DOCTORS (20 rows) — user_id 11-30
-- ============================================================
INSERT INTO Doctors (doctor_id, user_id, first_name, last_name, specialization, phone, email, bio, created_at) VALUES
(1,  11, 'Kemal',   'Avcı',    'Interventional Cardiology',    '+90 532 200 0001', 'doctor01@test.com', 'Expert in cardiac catheterization and stent procedures.',          '2025-01-02 09:00:00'),
(2,  12, 'Hülya',   'Başar',   'Clinical Neurology',           '+90 533 200 0002', 'doctor02@test.com', 'Specializes in epilepsy and movement disorders.',                  '2025-01-02 09:00:00'),
(3,  13, 'Tuncay',  'Gül',     'Sports Medicine Orthopedics',  '+90 534 200 0003', 'doctor03@test.com', 'Focuses on sports injuries and joint replacements.',               '2025-01-02 09:00:00'),
(4,  14, 'Sevgi',   'Taş',     'Pediatric Infectious Diseases','+90 535 200 0004', 'doctor04@test.com', 'Expert in childhood vaccinations and infections.',                 '2025-01-02 09:00:00'),
(5,  15, 'Volkan',  'Uysal',   'Cosmetic Dermatology',         '+90 536 200 0005', 'doctor05@test.com', 'Specializes in skin rejuvenation and laser treatments.',           '2025-01-02 09:00:00'),
(6,  16, 'Sibel',   'Çetin',   'Retinal Surgery',              '+90 537 200 0006', 'doctor06@test.com', 'Expert in retinal detachment and macular degeneration.',           '2025-01-02 09:00:00'),
(7,  17, 'Murat',   'Aslan',   'Otology and Neurotology',      '+90 538 200 0007', 'doctor07@test.com', 'Specializes in hearing disorders and cochlear implants.',           '2025-01-02 09:00:00'),
(8,  18, 'Hatice',  'Eren',    'Hepatology',                   '+90 539 200 0008', 'doctor08@test.com', 'Expert in liver diseases and hepatitis treatment.',                '2025-01-02 09:00:00'),
(9,  19, 'Levent',  'Şen',     'Interventional Pulmonology',   '+90 540 200 0009', 'doctor09@test.com', 'Focuses on bronchoscopy and lung cancer diagnosis.',               '2025-01-02 09:00:00'),
(10, 20, 'Esra',    'Kurt',    'Female Urology',               '+90 541 200 0010', 'doctor10@test.com', 'Specializes in urinary incontinence and pelvic floor disorders.',  '2025-01-02 09:00:00'),
(11, 21, 'Bülent',  'Yalçın',  'Child and Adolescent Psychiatry','+90 542 200 0011','doctor11@test.com','Expert in ADHD and autism spectrum disorders.',                   '2025-01-02 09:00:00'),
(12, 22, 'Nilgün',  'Özer',    'Medical Oncology',             '+90 543 200 0012', 'doctor12@test.com', 'Specializes in chemotherapy and targeted therapies.',              '2025-01-02 09:00:00'),
(13, 23, 'Serdar',  'Tunç',    'Diabetology',                  '+90 544 200 0013', 'doctor13@test.com', 'Expert in diabetes management and insulin therapy.',               '2025-01-02 09:00:00'),
(14, 24, 'Dilek',   'Sönmez',  'Clinical Rheumatology',        '+90 545 200 0014', 'doctor14@test.com', 'Focuses on rheumatoid arthritis and lupus treatment.',             '2025-01-02 09:00:00'),
(15, 25, 'Yusuf',   'Akın',    'Transplant Nephrology',        '+90 546 200 0015', 'doctor15@test.com', 'Specializes in kidney transplantation and dialysis.',              '2025-01-02 09:00:00'),
(16, 26, 'Burcu',   'Duman',   'Pediatric Hematology',         '+90 547 200 0016', 'doctor16@test.com', 'Expert in childhood leukemia and blood disorders.',                '2025-01-02 09:00:00'),
(17, 27, 'Onur',    'Çakır',   'Tropical Medicine',            '+90 548 200 0017', 'doctor17@test.com', 'Specializes in travel medicine and tropical infections.',           '2025-01-02 09:00:00'),
(18, 28, 'Şebnem',  'Kaplan',  'Minimally Invasive Surgery',   '+90 549 200 0018', 'doctor18@test.com', 'Expert in laparoscopic and robotic surgery.',                      '2025-01-02 09:00:00'),
(19, 29, 'Canan',   'Ünal',    'Maternal-Fetal Medicine',      '+90 550 200 0019', 'doctor19@test.com', 'Focuses on high-risk pregnancy management.',                       '2025-01-02 09:00:00'),
(20, 30, 'Tolga',   'Güler',   'Musculoskeletal Rehabilitation','+90 551 200 0020', 'doctor20@test.com', 'Specializes in post-operative and sports rehabilitation.',         '2025-01-02 09:00:00');

-- ============================================================
-- DOCTOR_DEPARTMENTS (20 rows — one department per doctor)
-- ============================================================
INSERT INTO Doctor_Departments (doctor_id, department_id) VALUES
(1,1),(2,2),(3,3),(4,4),(5,5),
(6,6),(7,7),(8,8),(9,9),(10,10),
(11,11),(12,12),(13,13),(14,14),(15,15),
(16,16),(17,17),(18,18),(19,19),(20,20);

-- ============================================================
-- APPOINTMENTS (40 rows)
--   1-20  → Completed  (past dates, have MedicalRecords)
--   21-35 → Scheduled  (future dates)
--   36-40 → Cancelled
-- Constraint: MINUTE must be in (0, 20, 40)
-- ============================================================
INSERT INTO Appointments (appointment_id, patient_id, doctor_id, appointment_date, duration, reason, status, created_at) VALUES
-- COMPLETED (1-20)
(1,  1,  1,  '2026-02-10 09:00:00', 30, 'Chest pain and shortness of breath',       'Completed', '2026-02-08 10:00:00'),
(2,  2,  2,  '2026-02-10 10:00:00', 45, 'Recurring headaches and dizziness',         'Completed', '2026-02-08 10:00:00'),
(3,  3,  3,  '2026-02-10 11:00:00', 30, 'Knee pain after sports injury',             'Completed', '2026-02-08 10:00:00'),
(4,  4,  4,  '2026-02-10 14:00:00', 20, 'Child vaccination appointment',             'Completed', '2026-02-08 10:00:00'),
(5,  5,  5,  '2026-02-10 15:00:00', 25, 'Skin rash and itching',                     'Completed', '2026-02-08 10:00:00'),
(6,  6,  6,  '2026-02-11 09:00:00', 40, 'Vision blurriness checkup',                 'Completed', '2026-02-08 10:00:00'),
(7,  7,  7,  '2026-02-11 10:00:00', 30, 'Hearing loss evaluation',                   'Completed', '2026-02-08 10:00:00'),
(8,  8,  8,  '2026-02-11 11:00:00', 30, 'Stomach pain and acid reflux',              'Completed', '2026-02-08 10:00:00'),
(9,  9,  9,  '2026-02-11 14:00:00', 35, 'Chronic cough evaluation',                  'Completed', '2026-02-08 10:00:00'),
(10, 10, 10, '2026-02-11 15:00:00', 30, 'Urinary tract infection symptoms',          'Completed', '2026-02-08 10:00:00'),
(11, 11, 11, '2026-02-12 09:00:00', 50, 'Anxiety and stress management',             'Completed', '2026-02-08 10:00:00'),
(12, 12, 12, '2026-02-12 10:00:00', 45, 'Cancer screening consultation',             'Completed', '2026-02-08 10:00:00'),
(13, 13, 13, '2026-02-12 11:00:00', 30, 'Diabetes checkup and management',           'Completed', '2026-02-08 10:00:00'),
(14, 14, 14, '2026-02-12 14:00:00', 40, 'Joint stiffness and pain',                  'Completed', '2026-02-08 10:00:00'),
(15, 15, 15, '2026-02-12 15:00:00', 45, 'Kidney function test follow-up',            'Completed', '2026-02-08 10:00:00'),
(16, 16, 16, '2026-02-13 09:00:00', 30, 'Anemia investigation',                      'Completed', '2026-02-08 10:00:00'),
(17, 17, 17, '2026-02-13 10:00:00', 25, 'Travel vaccination consultation',           'Completed', '2026-02-08 10:00:00'),
(18, 18, 18, '2026-02-13 11:00:00', 60, 'Abdominal pain evaluation',                 'Completed', '2026-02-08 10:00:00'),
(19, 19, 19, '2026-02-13 14:00:00', 40, 'Routine pregnancy checkup',                 'Completed', '2026-02-08 10:00:00'),
(20, 20, 20, '2026-02-13 15:00:00', 45, 'Post-surgery rehabilitation session',       'Completed', '2026-02-08 10:00:00'),
-- SCHEDULED (21-35)
(21, 21, 1,  '2026-05-10 09:00:00', 30, 'Cardiac stress test follow-up',             'Scheduled', '2026-05-01 10:00:00'),
(22, 22, 2,  '2026-05-10 10:00:00', 45, 'Memory issues consultation',                'Scheduled', '2026-05-01 10:00:00'),
(23, 23, 3,  '2026-05-10 11:00:00', 30, 'Lower back pain evaluation',                'Scheduled', '2026-05-01 10:00:00'),
(24, 24, 4,  '2026-05-11 09:00:00', 20, 'Pediatric growth assessment',               'Scheduled', '2026-05-01 10:00:00'),
(25, 25, 5,  '2026-05-11 10:00:00', 25, 'Acne treatment consultation',               'Scheduled', '2026-05-01 10:00:00'),
(26, 26, 6,  '2026-05-11 11:00:00', 40, 'Annual eye examination',                    'Scheduled', '2026-05-01 10:00:00'),
(27, 27, 7,  '2026-05-12 09:00:00', 30, 'Chronic sinusitis treatment',               'Scheduled', '2026-05-01 10:00:00'),
(28, 28, 8,  '2026-05-12 10:00:00', 30, 'Digestive issues consultation',             'Scheduled', '2026-05-01 10:00:00'),
(29, 29, 9,  '2026-05-12 11:00:00', 35, 'Asthma management follow-up',               'Scheduled', '2026-05-01 10:00:00'),
(30, 30, 10, '2026-05-13 09:00:00', 30, 'Kidney stone follow-up',                    'Scheduled', '2026-05-01 10:00:00'),
(31, 1,  11, '2026-05-13 10:00:00', 50, 'Depression therapy session',                'Scheduled', '2026-05-01 10:00:00'),
(32, 2,  12, '2026-05-13 11:00:00', 45, 'Chemotherapy follow-up',                    'Scheduled', '2026-05-01 10:00:00'),
(33, 3,  13, '2026-05-14 09:00:00', 30, 'Thyroid function evaluation',               'Scheduled', '2026-05-01 10:00:00'),
(34, 4,  14, '2026-05-14 10:00:00', 40, 'Lupus treatment follow-up',                 'Scheduled', '2026-05-01 10:00:00'),
(35, 5,  15, '2026-05-14 11:00:00', 45, 'Dialysis consultation',                     'Scheduled', '2026-05-01 10:00:00'),
-- CANCELLED (36-40)
(36, 6,  16, '2026-03-15 09:00:00', 30, 'Blood disorder follow-up',                  'Cancelled', '2026-03-10 10:00:00'),
(37, 7,  17, '2026-03-15 10:00:00', 25, 'Infectious disease screening',              'Cancelled', '2026-03-10 10:00:00'),
(38, 8,  18, '2026-03-15 11:00:00', 60, 'Laparoscopy consultation',                  'Cancelled', '2026-03-10 10:00:00'),
(39, 9,  19, '2026-03-16 09:00:00', 40, 'Prenatal screening',                        'Cancelled', '2026-03-10 10:00:00'),
(40, 10, 20, '2026-03-16 10:00:00', 45, 'Physiotherapy assessment',                  'Cancelled', '2026-03-10 10:00:00'),
-- EXTRA COMPLETED for Doctor 1 (cardiology demo data) — appointments 41-46
(41, 2,  1,  '2026-01-15 09:00:00', 30, 'Hypertension medication review',            'Completed', '2026-01-13 10:00:00'),
(42, 5,  1,  '2026-01-22 10:20:00', 30, 'Chest pain — new episode',                  'Completed', '2026-01-20 10:00:00'),
(43, 8,  1,  '2026-02-05 09:40:00', 30, 'Cardiac arrhythmia investigation',          'Completed', '2026-02-03 10:00:00'),
(44, 11, 1,  '2026-03-01 10:00:00', 30, 'Post-angioplasty follow-up',                'Completed', '2026-02-27 10:00:00'),
(45, 14, 1,  '2026-03-18 11:20:00', 30, 'Palpitations and fatigue evaluation',       'Completed', '2026-03-16 10:00:00'),
(46, 17, 1,  '2026-04-10 09:00:00', 30, 'Annual cardiac screening',                  'Completed', '2026-04-08 10:00:00');

-- ============================================================
-- MEDICAL RECORDS (20 rows — one per Completed appointment)
-- ============================================================
INSERT INTO MedicalRecords (record_id, appointment_id, patient_id, doctor_id, diagnosis, treatment, record_date, created_at) VALUES
(1,  1,  1,  1,  'Hypertension Stage 1',              'Lisinopril 10mg + low-sodium diet',          '2026-02-10', '2026-02-10 10:00:00'),
(2,  2,  2,  2,  'Migraine without aura',              'Ibuprofen 400mg + Paracetamol 500mg',        '2026-02-10', '2026-02-10 11:00:00'),
(3,  3,  3,  3,  'Anterior cruciate ligament tear',    'Physical therapy + rest 4 weeks',            '2026-02-10', '2026-02-10 12:00:00'),
(4,  4,  4,  4,  'Routine vaccination — healthy',      'MMR vaccine administered',                   '2026-02-10', '2026-02-10 15:00:00'),
(5,  5,  5,  5,  'Contact dermatitis',                 'Cetirizine 10mg + topical corticosteroids',  '2026-02-10', '2026-02-10 16:00:00'),
(6,  6,  6,  6,  'Myopia (-2.50 diopters)',             'Corrective lenses prescribed',               '2026-02-11', '2026-02-11 10:00:00'),
(7,  7,  7,  7,  'Otitis media',                       'Amoxicillin 500mg 7 days',                   '2026-02-11', '2026-02-11 11:00:00'),
(8,  8,  8,  8,  'Gastroesophageal reflux disease',    'Omeprazole 20mg daily',                      '2026-02-11', '2026-02-11 12:00:00'),
(9,  9,  9,  9,  'Bronchial asthma — mild persistent', 'Inhaler therapy + Ibuprofen 200mg',          '2026-02-11', '2026-02-11 15:00:00'),
(10, 10, 10, 10, 'Urinary tract infection',            'Amoxicillin 500mg + Ibuprofen 400mg',        '2026-02-11', '2026-02-11 16:00:00'),
(11, 11, 11, 11, 'Generalized anxiety disorder',       'CBT sessions + Paracetamol as needed',       '2026-02-12', '2026-02-12 10:00:00'),
(12, 12, 12, 12, 'Benign tumor — observation only',    'Follow-up in 3 months + Aspirin 100mg',      '2026-02-12', '2026-02-12 11:00:00'),
(13, 13, 13, 13, 'Type 2 diabetes mellitus',           'Metformin 500mg + Atorvastatin 20mg',        '2026-02-12', '2026-02-12 12:00:00'),
(14, 14, 14, 14, 'Rheumatoid arthritis',               'Ibuprofen 400mg + Aspirin 100mg',            '2026-02-12', '2026-02-12 15:00:00'),
(15, 15, 15, 15, 'Chronic kidney disease stage 2',     'Lisinopril 10mg + dietary monitoring',       '2026-02-12', '2026-02-12 16:00:00'),
(16, 16, 16, 16, 'Iron deficiency anemia',             'Iron supplements + Omeprazole 20mg',         '2026-02-13', '2026-02-13 10:00:00'),
(17, 17, 17, 17, 'Bacterial infection — travel-related','Azithromycin 500mg 5 days',                 '2026-02-13', '2026-02-13 11:00:00'),
(18, 18, 18, 18, 'Acute appendicitis',                 'Laparoscopic appendectomy + Amoxicillin',    '2026-02-13', '2026-02-13 12:00:00'),
(19, 19, 19, 19, 'Normal pregnancy — 12th week',       'Prenatal vitamins + Paracetamol as needed',  '2026-02-13', '2026-02-13 15:00:00'),
(20, 20, 20, 20, 'Lumbar disc herniation',             'Physiotherapy 3x/week + Ibuprofen 400mg',   '2026-02-13', '2026-02-13 16:00:00'),
-- Extra records for Doctor 1 (cardiology) — records 21-26
(21, 41, 2,  1,  'Hypertension Stage 2',              'Amlodipine 5mg added + Lisinopril 10mg continued',       '2026-01-15', '2026-01-15 10:00:00'),
(22, 42, 5,  1,  'Unstable angina — NSTEMI ruled out','Aspirin 300mg loading + Metoprolol 50mg initiated',      '2026-01-22', '2026-01-22 11:00:00'),
(23, 43, 8,  1,  'Paroxysmal atrial fibrillation',    'Metoprolol 100mg + Aspirin 100mg anticoagulation',       '2026-02-05', '2026-02-05 10:00:00'),
(24, 44, 11, 1,  'Post-angioplasty — stable recovery','Aspirin 100mg + Atorvastatin 40mg continued',            '2026-03-01', '2026-03-01 11:00:00'),
(25, 45, 14, 1,  'Supraventricular tachycardia (SVT)','Metoprolol 50mg + rest + follow-up in 4 weeks',          '2026-03-18', '2026-03-18 12:00:00'),
(26, 46, 17, 1,  'Hypertension — well controlled',    'Current regimen effective — Lisinopril 10mg continue',   '2026-04-10', '2026-04-10 10:00:00');

-- ============================================================
-- MEDICATIONS (10 rows)
-- ============================================================
INSERT INTO Medications (medication_id, name) VALUES
(1,  'Paracetamol'),
(2,  'Ibuprofen'),
(3,  'Amoxicillin'),
(4,  'Aspirin'),
(5,  'Cetirizine'),
(6,  'Metformin'),
(7,  'Omeprazole'),
(8,  'Atorvastatin'),
(9,  'Lisinopril'),
(10, 'Azithromycin'),
(11, 'Amlodipine'),
(12, 'Metoprolol');

-- ============================================================
-- PRESCRIPTIONS (26 rows)
-- record_id → medication_id, dosage, duration
-- ============================================================
INSERT INTO Prescriptions (record_id, medication_id, dosage, duration) VALUES
-- Record 1 (Hypertension): Lisinopril + Aspirin
(1,  9, '10mg',  '30 days'),
(1,  4, '100mg', '30 days'),
-- Record 2 (Migraine): Ibuprofen + Paracetamol
(2,  2, '400mg', '5 days'),
(2,  1, '500mg', '5 days'),
-- Record 3 (ACL tear): Ibuprofen
(3,  2, '400mg', '7 days'),
-- Record 4 (Vaccination): Paracetamol
(4,  1, '250mg', '3 days'),
-- Record 5 (Dermatitis): Cetirizine
(5,  5, '10mg',  '14 days'),
-- Record 6 (Myopia): Paracetamol (post-exam)
(6,  1, '500mg', '3 days'),
-- Record 7 (Otitis media): Amoxicillin
(7,  3, '500mg', '7 days'),
-- Record 8 (GERD): Omeprazole
(8,  7, '20mg',  '14 days'),
-- Record 9 (Asthma): Ibuprofen
(9,  2, '200mg', '7 days'),
-- Record 10 (UTI): Amoxicillin + Ibuprofen
(10, 3, '500mg', '7 days'),
(10, 2, '400mg', '5 days'),
-- Record 11 (Anxiety): Paracetamol
(11, 1, '500mg', '5 days'),
-- Record 12 (Benign tumor): Aspirin
(12, 4, '100mg', '14 days'),
-- Record 13 (Diabetes): Metformin + Atorvastatin
(13, 6, '500mg', '30 days'),
(13, 8, '20mg',  '30 days'),
-- Record 14 (Rheumatoid arthritis): Ibuprofen + Aspirin
(14, 2, '400mg', '14 days'),
(14, 4, '100mg', '14 days'),
-- Record 15 (CKD): Lisinopril
(15, 9, '10mg',  '30 days'),
-- Record 16 (Anemia): Omeprazole
(16, 7, '20mg',  '30 days'),
-- Record 17 (Bacterial infection): Azithromycin
(17, 10,'500mg', '5 days'),
-- Record 18 (Appendicitis): Ibuprofen + Amoxicillin
(18, 2, '400mg', '7 days'),
(18, 3, '500mg', '7 days'),
-- Record 19 (Pregnancy): Paracetamol
(19, 1, '500mg', 'As needed'),
-- Record 20 (Lumbar disc): Ibuprofen
(20, 2, '400mg', '10 days'),
-- Records 21-26 (Doctor 1 — cardiology)
(21, 9,  '10mg',  '30 days'),  -- Lisinopril
(21, 11, '5mg',   '30 days'),  -- Amlodipine
(22, 4,  '300mg', '7 days'),   -- Aspirin loading
(22, 12, '50mg',  '30 days'),  -- Metoprolol
(23, 12, '100mg', '30 days'),  -- Metoprolol
(23, 4,  '100mg', '30 days'),  -- Aspirin
(24, 4,  '100mg', '30 days'),  -- Aspirin
(24, 8,  '40mg',  '30 days'),  -- Atorvastatin
(25, 12, '50mg',  '14 days'),  -- Metoprolol
(26, 9,  '10mg',  '30 days');  -- Lisinopril

-- ============================================================
-- BILLING (20 rows — one per Completed appointment)
-- ============================================================
INSERT INTO Billing (bill_id, appointment_id, total_amount, payment_status, billing_date, created_at) VALUES
(1,  1,  350.00, 'Paid',    '2026-02-10', '2026-02-10 10:30:00'),
(2,  2,  300.00, 'Paid',    '2026-02-10', '2026-02-10 11:30:00'),
(3,  3,  250.00, 'Paid',    '2026-02-10', '2026-02-10 12:30:00'),
(4,  4,  150.00, 'Paid',    '2026-02-10', '2026-02-10 15:30:00'),
(5,  5,  200.00, 'Paid',    '2026-02-10', '2026-02-10 16:30:00'),
(6,  6,  400.00, 'Paid',    '2026-02-11', '2026-02-11 10:30:00'),
(7,  7,  200.00, 'Paid',    '2026-02-11', '2026-02-11 11:30:00'),
(8,  8,  250.00, 'Paid',    '2026-02-11', '2026-02-11 12:30:00'),
(9,  9,  300.00, 'Paid',    '2026-02-11', '2026-02-11 15:30:00'),
(10, 10, 250.00, 'Paid',    '2026-02-11', '2026-02-11 16:30:00'),
(11, 11, 350.00, 'Paid',    '2026-02-12', '2026-02-12 10:30:00'),
(12, 12, 500.00, 'Paid',    '2026-02-12', '2026-02-12 11:30:00'),
(13, 13, 280.00, 'Paid',    '2026-02-12', '2026-02-12 12:30:00'),
(14, 14, 320.00, 'Paid',    '2026-02-12', '2026-02-12 15:30:00'),
(15, 15, 450.00, 'Paid',    '2026-02-12', '2026-02-12 16:30:00'),
(16, 16, 250.00, 'Pending', '2026-02-13', '2026-02-13 10:30:00'),
(17, 17, 200.00, 'Paid',    '2026-02-13', '2026-02-13 11:30:00'),
(18, 18, 800.00, 'Paid',    '2026-02-13', '2026-02-13 12:30:00'),
(19, 19, 300.00, 'Pending', '2026-02-13', '2026-02-13 15:30:00'),
(20, 20, 150.00, 'Failed',  '2026-02-13', '2026-02-13 16:30:00'),
-- Extra billing for Doctor 1 (appointments 41-46)
(21, 41, 280.00, 'Paid',    '2026-01-15', '2026-01-15 10:30:00'),
(22, 42, 350.00, 'Paid',    '2026-01-22', '2026-01-22 11:30:00'),
(23, 43, 400.00, 'Pending', '2026-02-05', '2026-02-05 10:30:00'),
(24, 44, 320.00, 'Paid',    '2026-03-01', '2026-03-01 11:30:00'),
(25, 45, 300.00, 'Paid',    '2026-03-18', '2026-03-18 12:30:00'),
(26, 46, 250.00, 'Failed',  '2026-04-10', '2026-04-10 10:30:00');

-- ============================================================
-- RADIOLOGICAL RESULTS (6 rows for Doctor 1 — cardiology)
-- ============================================================
INSERT INTO RadiologicalResults (result_id, appointment_id, patient_id, doctor_id, image_type, body_part, image_url, findings, result_date, created_at) VALUES
(1, 1,  1,  1, 'X-Ray',               'Chest', '/images/radiology/xray-chest-1.svg',  'Mild cardiomegaly noted. No pulmonary edema or pleural effusion detected.',                  '2026-02-10', '2026-02-10 09:30:00'),
(2, 41, 2,  1, 'ECG',                 'Heart', '/images/radiology/ecg-heart-2.svg',   'Sinus rhythm with occasional premature ventricular complexes. QT interval normal.',         '2026-01-15', '2026-01-15 09:30:00'),
(3, 42, 5,  1, 'CT Scan',             'Chest', '/images/radiology/ct-chest-3.svg',    'No pulmonary embolism detected. Mild pericardial thickening. Aorta within normal limits.', '2026-01-22', '2026-01-22 10:50:00'),
(4, 43, 8,  1, 'Echocardiography',    'Heart', '/images/radiology/echo-heart-4.svg',  'LVEF 52%. Mild mitral regurgitation. No significant wall motion abnormality.',               '2026-02-05', '2026-02-05 10:10:00'),
(5, 44, 11, 1, 'Coronary Angiography','Heart', '/images/radiology/angio-heart-5.svg', 'Previously placed stent patent. No in-stent restenosis. LAD flow TIMI-3.',                  '2026-03-01', '2026-03-01 10:30:00'),
(6, 46, 17, 1, 'X-Ray',               'Chest', '/images/radiology/xray-chest-6.svg',  'Heart size within normal limits. Lung fields clear. No acute cardiopulmonary process.',    '2026-04-10', '2026-04-10 09:30:00');
    