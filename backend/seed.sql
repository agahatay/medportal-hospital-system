USE hospital_db;

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE appointments;
TRUNCATE TABLE doctors;
TRUNCATE TABLE patients;
TRUNCATE TABLE departments;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;

-- Bcrypt hash for password "123456" with salt rounds 10
SET @hash = '$2b$10$ZUT1GRjYF8IbUaRDKoGcoODmn4eXXqqNRRDVECg5/pZV9sQoZV3VO';

-- =============================================
-- DEPARTMENTS (20 rows)
-- =============================================
INSERT INTO departments (id, name, description, created_at) VALUES
(1, 'Cardiology', 'Heart and cardiovascular system treatments', '2025-01-01 08:00:00'),
(2, 'Neurology', 'Brain and nervous system disorders', '2025-01-01 08:00:00'),
(3, 'Orthopedics', 'Bone, joint, and muscle treatments', '2025-01-01 08:00:00'),
(4, 'Pediatrics', 'Medical care for infants and children', '2025-01-01 08:00:00'),
(5, 'Dermatology', 'Skin, hair, and nail treatments', '2025-01-01 08:00:00'),
(6, 'Ophthalmology', 'Eye and vision care', '2025-01-01 08:00:00'),
(7, 'ENT', 'Ear, nose, and throat treatments', '2025-01-01 08:00:00'),
(8, 'Gastroenterology', 'Digestive system disorders', '2025-01-01 08:00:00'),
(9, 'Pulmonology', 'Lung and respiratory treatments', '2025-01-01 08:00:00'),
(10, 'Urology', 'Urinary tract and reproductive system', '2025-01-01 08:00:00'),
(11, 'Psychiatry', 'Mental health and behavioral disorders', '2025-01-01 08:00:00'),
(12, 'Oncology', 'Cancer diagnosis and treatment', '2025-01-01 08:00:00'),
(13, 'Endocrinology', 'Hormone and metabolic disorders', '2025-01-01 08:00:00'),
(14, 'Rheumatology', 'Autoimmune and joint diseases', '2025-01-01 08:00:00'),
(15, 'Nephrology', 'Kidney diseases and treatments', '2025-01-01 08:00:00'),
(16, 'Hematology', 'Blood disorders and treatments', '2025-01-01 08:00:00'),
(17, 'Infectious Diseases', 'Infectious disease treatment', '2025-01-01 08:00:00'),
(18, 'General Surgery', 'Surgical procedures', '2025-01-01 08:00:00'),
(19, 'Obstetrics and Gynecology', 'Women health and pregnancy', '2025-01-01 08:00:00'),
(20, 'Physical Therapy', 'Rehabilitation services', '2025-01-01 08:00:00');

-- =============================================
-- USERS (60 rows: 10 ADMIN, 20 DOCTOR, 30 PATIENT)
-- =============================================
INSERT INTO users (id, email, password, role, created_at) VALUES
-- ADMIN users (1-10)
(1, 'admin01@test.com', @hash, 'ADMIN', '2025-01-01 09:00:00'),
(2, 'admin02@test.com', @hash, 'ADMIN', '2025-01-01 09:00:00'),
(3, 'admin03@test.com', @hash, 'ADMIN', '2025-01-01 09:00:00'),
(4, 'admin04@test.com', @hash, 'ADMIN', '2025-01-01 09:00:00'),
(5, 'admin05@test.com', @hash, 'ADMIN', '2025-01-01 09:00:00'),
(6, 'admin06@test.com', @hash, 'ADMIN', '2025-01-01 09:00:00'),
(7, 'admin07@test.com', @hash, 'ADMIN', '2025-01-01 09:00:00'),
(8, 'admin08@test.com', @hash, 'ADMIN', '2025-01-01 09:00:00'),
(9, 'admin09@test.com', @hash, 'ADMIN', '2025-01-01 09:00:00'),
(10, 'admin10@test.com', @hash, 'ADMIN', '2025-01-01 09:00:00'),
-- DOCTOR users (11-30)
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
-- PATIENT users (31-60)
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

-- =============================================
-- PATIENTS (30 rows) - Turkish names, linked to user_id 31-60
-- =============================================
INSERT INTO patients (id, user_id, name, phone, address, date_of_birth, gender, created_at) VALUES
(1, 31, 'Ahmet Yılmaz', '+90 532 111 0001', 'Kadıköy, İstanbul', '1985-03-15', 'MALE', '2025-01-03 09:00:00'),
(2, 32, 'Elif Kaya', '+90 533 111 0002', 'Çankaya, Ankara', '1990-07-22', 'FEMALE', '2025-01-03 09:00:00'),
(3, 33, 'Mehmet Demir', '+90 534 111 0003', 'Bornova, İzmir', '1978-11-08', 'MALE', '2025-01-03 09:00:00'),
(4, 34, 'Zeynep Öztürk', '+90 535 111 0004', 'Nilüfer, Bursa', '1995-01-30', 'FEMALE', '2025-01-03 09:00:00'),
(5, 35, 'Mustafa Şahin', '+90 536 111 0005', 'Seyhan, Adana', '1982-06-12', 'MALE', '2025-01-03 09:00:00'),
(6, 36, 'Fatma Arslan', '+90 537 111 0006', 'Muratpaşa, Antalya', '1988-09-25', 'FEMALE', '2025-01-03 09:00:00'),
(7, 37, 'Ali Çelik', '+90 538 111 0007', 'Atakum, Samsun', '1975-04-18', 'MALE', '2025-01-03 09:00:00'),
(8, 38, 'Ayşe Koç', '+90 539 111 0008', 'Meram, Konya', '1992-12-05', 'FEMALE', '2025-01-03 09:00:00'),
(9, 39, 'Hasan Yıldız', '+90 540 111 0009', 'Odunpazarı, Eskişehir', '1980-02-28', 'MALE', '2025-01-03 09:00:00'),
(10, 40, 'Merve Aydın', '+90 541 111 0010', 'Yıldırım, Bursa', '1997-08-14', 'FEMALE', '2025-01-03 09:00:00'),
(11, 41, 'Emre Erdoğan', '+90 542 111 0011', 'Beşiktaş, İstanbul', '1983-05-20', 'MALE', '2025-01-03 09:00:00'),
(12, 42, 'Selin Güneş', '+90 543 111 0012', 'Mamak, Ankara', '1991-10-03', 'FEMALE', '2025-01-03 09:00:00'),
(13, 43, 'Burak Özdemir', '+90 544 111 0013', 'Karşıyaka, İzmir', '1976-07-16', 'MALE', '2025-01-03 09:00:00'),
(14, 44, 'Deniz Aksoy', '+90 545 111 0014', 'Osmangazi, Bursa', '1994-03-09', 'FEMALE', '2025-01-03 09:00:00'),
(15, 45, 'Oğuz Polat', '+90 546 111 0015', 'Yüreğir, Adana', '1987-11-22', 'MALE', '2025-01-03 09:00:00'),
(16, 46, 'Ceren Korkmaz', '+90 547 111 0016', 'Kepez, Antalya', '1999-06-07', 'FEMALE', '2025-01-03 09:00:00'),
(17, 47, 'Serkan Özkan', '+90 548 111 0017', 'İlkadım, Samsun', '1981-01-25', 'MALE', '2025-01-03 09:00:00'),
(18, 48, 'Gizem Kılıç', '+90 549 111 0018', 'Selçuklu, Konya', '1993-09-11', 'FEMALE', '2025-01-03 09:00:00'),
(19, 49, 'Cem Tekin', '+90 550 111 0019', 'Tepebaşı, Eskişehir', '1979-04-04', 'MALE', '2025-01-03 09:00:00'),
(20, 50, 'Pınar Doğan', '+90 551 111 0020', 'Üsküdar, İstanbul', '1996-12-19', 'FEMALE', '2025-01-03 09:00:00'),
(21, 51, 'Barış Çetin', '+90 552 111 0021', 'Etimesgut, Ankara', '1984-08-03', 'MALE', '2025-01-03 09:00:00'),
(22, 52, 'Esra Yılmaz', '+90 553 111 0022', 'Konak, İzmir', '1989-02-17', 'FEMALE', '2025-01-03 09:00:00'),
(23, 53, 'Tolga Şen', '+90 554 111 0023', 'Gebze, Kocaeli', '1977-06-29', 'MALE', '2025-01-03 09:00:00'),
(24, 54, 'Naz Karaca', '+90 555 111 0024', 'Mezitli, Mersin', '1998-11-11', 'FEMALE', '2025-01-03 09:00:00'),
(25, 55, 'Kaan Aslan', '+90 556 111 0025', 'Pamukkale, Denizli', '1986-03-08', 'MALE', '2025-01-03 09:00:00'),
(26, 56, 'Yasemin Koç', '+90 557 111 0026', 'Osmangazi, Bursa', '1992-07-21', 'FEMALE', '2025-01-03 09:00:00'),
(27, 57, 'Uğur Demirtaş', '+90 558 111 0027', 'Keçiören, Ankara', '1980-12-14', 'MALE', '2025-01-03 09:00:00'),
(28, 58, 'Tuğba Eren', '+90 559 111 0028', 'Şişli, İstanbul', '1995-05-26', 'FEMALE', '2025-01-03 09:00:00'),
(29, 59, 'Onur Kara', '+90 560 111 0029', 'Çiğli, İzmir', '1983-09-18', 'MALE', '2025-01-03 09:00:00'),
(30, 60, 'Büşra Altın', '+90 561 111 0030', 'Tarsus, Mersin', '1991-01-05', 'FEMALE', '2025-01-03 09:00:00');

-- =============================================
-- DOCTORS (20 rows) - Turkish names, linked to user_id 11-30
-- =============================================
INSERT INTO doctors (id, user_id, department_id, name, specialization, phone, bio, created_at) VALUES
(1, 11, 1, 'Dr. Kemal Avcı', 'Interventional Cardiology', '+90 532 200 0001', 'Expert in cardiac catheterization and stent procedures.', '2025-01-02 09:00:00'),
(2, 12, 2, 'Dr. Hülya Başar', 'Clinical Neurology', '+90 533 200 0002', 'Specializes in epilepsy and movement disorders.', '2025-01-02 09:00:00'),
(3, 13, 3, 'Dr. Tuncay Gül', 'Sports Medicine Orthopedics', '+90 534 200 0003', 'Focuses on sports injuries and joint replacements.', '2025-01-02 09:00:00'),
(4, 14, 4, 'Dr. Sevgi Taş', 'Pediatric Infectious Diseases', '+90 535 200 0004', 'Expert in childhood vaccinations and infections.', '2025-01-02 09:00:00'),
(5, 15, 5, 'Dr. Volkan Uysal', 'Cosmetic Dermatology', '+90 536 200 0005', 'Specializes in skin rejuvenation and laser treatments.', '2025-01-02 09:00:00'),
(6, 16, 6, 'Dr. Sibel Çetin', 'Retinal Surgery', '+90 537 200 0006', 'Expert in retinal detachment and macular degeneration.', '2025-01-02 09:00:00'),
(7, 17, 7, 'Dr. Murat Aslan', 'Otology and Neurotology', '+90 538 200 0007', 'Specializes in hearing disorders and cochlear implants.', '2025-01-02 09:00:00'),
(8, 18, 8, 'Dr. Hatice Eren', 'Hepatology', '+90 539 200 0008', 'Expert in liver diseases and hepatitis treatment.', '2025-01-02 09:00:00'),
(9, 19, 9, 'Dr. Levent Şen', 'Interventional Pulmonology', '+90 540 200 0009', 'Focuses on bronchoscopy and lung cancer diagnosis.', '2025-01-02 09:00:00'),
(10, 20, 10, 'Dr. Esra Kurt', 'Female Urology', '+90 541 200 0010', 'Specializes in urinary incontinence and pelvic floor.', '2025-01-02 09:00:00'),
(11, 21, 11, 'Dr. Bülent Yalçın', 'Child Psychiatry', '+90 542 200 0011', 'Expert in ADHD and autism spectrum disorders.', '2025-01-02 09:00:00'),
(12, 22, 12, 'Dr. Nilgün Özer', 'Medical Oncology', '+90 543 200 0012', 'Specializes in chemotherapy and targeted therapies.', '2025-01-02 09:00:00'),
(13, 23, 13, 'Dr. Serdar Tunç', 'Diabetology', '+90 544 200 0013', 'Expert in diabetes management and insulin therapy.', '2025-01-02 09:00:00'),
(14, 24, 14, 'Dr. Dilek Sönmez', 'Clinical Rheumatology', '+90 545 200 0014', 'Focuses on rheumatoid arthritis and lupus treatment.', '2025-01-02 09:00:00'),
(15, 25, 15, 'Dr. Yusuf Akın', 'Transplant Nephrology', '+90 546 200 0015', 'Specializes in kidney transplantation and dialysis.', '2025-01-02 09:00:00'),
(16, 26, 16, 'Dr. Burcu Duman', 'Pediatric Hematology', '+90 547 200 0016', 'Expert in childhood leukemia and blood disorders.', '2025-01-02 09:00:00'),
(17, 27, 17, 'Dr. Onur Çakır', 'Tropical Medicine', '+90 548 200 0017', 'Specializes in travel medicine and tropical infections.', '2025-01-02 09:00:00'),
(18, 28, 18, 'Dr. Şebnem Kaplan', 'Minimally Invasive Surgery', '+90 549 200 0018', 'Expert in laparoscopic and robotic surgery.', '2025-01-02 09:00:00'),
(19, 29, 19, 'Dr. Canan Ünal', 'Maternal-Fetal Medicine', '+90 550 200 0019', 'Focuses on high-risk pregnancy management.', '2025-01-02 09:00:00'),
(20, 30, 20, 'Dr. Tolga Güler', 'Musculoskeletal Rehab', '+90 551 200 0020', 'Specializes in post-operative rehabilitation.', '2025-01-02 09:00:00');

-- =============================================
-- APPOINTMENTS (40 rows) - 20-min slots, unique (doctor_id, appointment_date)
-- =============================================
INSERT INTO appointments (id, patient_id, doctor_id, appointment_date, status, reason, created_at) VALUES
-- Doctor 1 appointments
(1, 1, 1, '2026-02-10 09:00:00', 'SCHEDULED', 'Chest pain and shortness of breath', '2026-02-08 10:00:00'),
(2, 2, 1, '2026-02-10 09:20:00', 'SCHEDULED', 'Routine cardiac checkup', '2026-02-08 10:00:00'),
(3, 3, 1, '2026-02-10 09:40:00', 'COMPLETED', 'Heart palpitation evaluation', '2026-02-08 10:00:00'),
(4, 4, 1, '2026-02-10 10:00:00', 'CANCELLED', 'Blood pressure monitoring', '2026-02-08 10:00:00'),
-- Doctor 2 appointments
(5, 5, 2, '2026-02-10 09:00:00', 'SCHEDULED', 'Recurring headaches and dizziness', '2026-02-08 10:00:00'),
(6, 6, 2, '2026-02-10 09:20:00', 'SCHEDULED', 'Memory issues consultation', '2026-02-08 10:00:00'),
(7, 7, 2, '2026-02-10 09:40:00', 'COMPLETED', 'Migraine treatment follow-up', '2026-02-08 10:00:00'),
(8, 8, 2, '2026-02-10 10:00:00', 'SCHEDULED', 'Numbness in extremities', '2026-02-08 10:00:00'),
-- Doctor 3 appointments
(9, 9, 3, '2026-02-10 11:00:00', 'SCHEDULED', 'Knee pain after sports injury', '2026-02-08 10:00:00'),
(10, 10, 3, '2026-02-10 11:20:00', 'SCHEDULED', 'Lower back pain evaluation', '2026-02-08 10:00:00'),
(11, 11, 3, '2026-02-10 14:00:00', 'COMPLETED', 'Hip replacement consultation', '2026-02-08 10:00:00'),
(12, 12, 3, '2026-02-10 14:20:00', 'CANCELLED', 'Shoulder injury assessment', '2026-02-08 10:00:00'),
-- Doctor 4 appointments
(13, 13, 4, '2026-02-10 09:00:00', 'SCHEDULED', 'Child vaccination appointment', '2026-02-08 10:00:00'),
(14, 14, 4, '2026-02-10 09:20:00', 'SCHEDULED', 'Pediatric growth assessment', '2026-02-08 10:00:00'),
-- Doctor 5 appointments
(15, 15, 5, '2026-02-10 14:00:00', 'SCHEDULED', 'Skin rash and itching', '2026-02-08 10:00:00'),
(16, 16, 5, '2026-02-10 14:20:00', 'COMPLETED', 'Acne treatment consultation', '2026-02-08 10:00:00'),
-- Doctor 6 appointments
(17, 17, 6, '2026-02-11 09:00:00', 'SCHEDULED', 'Vision blurriness checkup', '2026-02-08 10:00:00'),
(18, 18, 6, '2026-02-11 09:20:00', 'SCHEDULED', 'Annual eye examination', '2026-02-08 10:00:00'),
-- Doctor 7 appointments
(19, 19, 7, '2026-02-11 10:00:00', 'SCHEDULED', 'Hearing loss evaluation', '2026-02-08 10:00:00'),
(20, 20, 7, '2026-02-11 10:20:00', 'COMPLETED', 'Chronic sinusitis treatment', '2026-02-08 10:00:00'),
-- Doctor 8 appointments
(21, 21, 8, '2026-02-11 11:00:00', 'SCHEDULED', 'Stomach pain and acid reflux', '2026-02-08 10:00:00'),
(22, 22, 8, '2026-02-11 11:20:00', 'CANCELLED', 'Digestive issues consultation', '2026-02-08 10:00:00'),
-- Doctor 9 appointments
(23, 23, 9, '2026-02-11 14:00:00', 'SCHEDULED', 'Chronic cough evaluation', '2026-02-08 10:00:00'),
(24, 24, 9, '2026-02-11 14:20:00', 'SCHEDULED', 'Asthma management follow-up', '2026-02-08 10:00:00'),
-- Doctor 10 appointments
(25, 25, 10, '2026-02-12 09:00:00', 'SCHEDULED', 'Urinary tract infection symptoms', '2026-02-08 10:00:00'),
(26, 26, 10, '2026-02-12 09:20:00', 'COMPLETED', 'Kidney stone follow-up', '2026-02-08 10:00:00'),
-- Doctor 11 appointments
(27, 27, 11, '2026-02-12 10:00:00', 'SCHEDULED', 'Anxiety and stress management', '2026-02-08 10:00:00'),
(28, 28, 11, '2026-02-12 10:20:00', 'SCHEDULED', 'Depression therapy session', '2026-02-08 10:00:00'),
-- Doctor 12 appointments
(29, 29, 12, '2026-02-12 11:00:00', 'SCHEDULED', 'Cancer screening consultation', '2026-02-08 10:00:00'),
(30, 30, 12, '2026-02-12 11:20:00', 'CANCELLED', 'Chemotherapy follow-up', '2026-02-08 10:00:00'),
-- Doctor 13 appointments
(31, 1, 13, '2026-02-12 14:00:00', 'SCHEDULED', 'Diabetes checkup and management', '2026-02-08 10:00:00'),
(32, 2, 13, '2026-02-12 14:20:00', 'COMPLETED', 'Thyroid function evaluation', '2026-02-08 10:00:00'),
-- Doctor 14 appointments
(33, 3, 14, '2026-02-13 09:00:00', 'SCHEDULED', 'Joint stiffness and pain', '2026-02-08 10:00:00'),
(34, 4, 14, '2026-02-13 09:20:00', 'SCHEDULED', 'Lupus treatment follow-up', '2026-02-08 10:00:00'),
-- Doctor 15 appointments
(35, 5, 15, '2026-02-13 10:00:00', 'SCHEDULED', 'Kidney function test follow-up', '2026-02-08 10:00:00'),
(36, 6, 15, '2026-02-13 10:20:00', 'COMPLETED', 'Dialysis consultation', '2026-02-08 10:00:00'),
-- Doctor 16 appointments
(37, 7, 16, '2026-02-13 11:00:00', 'SCHEDULED', 'Anemia investigation', '2026-02-08 10:00:00'),
(38, 8, 16, '2026-02-13 11:20:00', 'CANCELLED', 'Blood disorder follow-up', '2026-02-08 10:00:00'),
-- Doctor 17 appointments
(39, 9, 17, '2026-02-13 14:00:00', 'SCHEDULED', 'Travel vaccination consultation', '2026-02-08 10:00:00'),
(40, 10, 17, '2026-02-13 14:20:00', 'SCHEDULED', 'Infectious disease screening', '2026-02-08 10:00:00');
