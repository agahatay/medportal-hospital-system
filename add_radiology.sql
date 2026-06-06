-- ============================================================
-- add_radiology.sql
-- Run this ONCE on an existing hospital_db to add:
--   1. RadiologicalResults table
--   2. Two new medications (Amlodipine, Metoprolol)
--   3. Six extra appointments for Doctor 1 (Kemal Avcı)
--   4. Matching medical records, prescriptions, billing
--   5. Six radiological result rows for Doctor 1
--
-- Safe to run if seed.sql was already loaded — uses INSERT IGNORE.
-- ============================================================

USE hospital_db;

-- 1. Create RadiologicalResults table if it does not exist
CREATE TABLE IF NOT EXISTS RadiologicalResults (
    result_id      INT PRIMARY KEY AUTO_INCREMENT,
    appointment_id INT NOT NULL,
    patient_id     INT NOT NULL,
    doctor_id      INT NOT NULL,
    image_type     VARCHAR(100),
    body_part      VARCHAR(100),
    image_url      VARCHAR(255),
    findings       TEXT,
    result_date    DATE,
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (appointment_id) REFERENCES Appointments(appointment_id) ON DELETE CASCADE,
    FOREIGN KEY (patient_id)     REFERENCES Patients(patient_id)         ON DELETE CASCADE,
    FOREIGN KEY (doctor_id)      REFERENCES Doctors(doctor_id)            ON DELETE CASCADE
);

-- 2. New medications
INSERT IGNORE INTO Medications (medication_id, name) VALUES
(11, 'Amlodipine'),
(12, 'Metoprolol');

-- 3. Extra completed appointments for Doctor 1 (Kemal Avcı — Cardiology)
--    Patients: 2=Elif Kaya, 5=Mustafa Şahin, 8=Ayşe Koç,
--              11=Emre Erdoğan, 14=Deniz Aksoy, 17=Serkan Özkan
INSERT IGNORE INTO Appointments (appointment_id, patient_id, doctor_id, appointment_date, duration, reason, status, created_at) VALUES
(41, 2,  1, '2026-01-15 09:00:00', 30, 'Hypertension medication review',      'Completed', '2026-01-13 10:00:00'),
(42, 5,  1, '2026-01-22 10:20:00', 30, 'Chest pain — new episode',             'Completed', '2026-01-20 10:00:00'),
(43, 8,  1, '2026-02-05 09:40:00', 30, 'Cardiac arrhythmia investigation',     'Completed', '2026-02-03 10:00:00'),
(44, 11, 1, '2026-03-01 10:00:00', 30, 'Post-angioplasty follow-up',           'Completed', '2026-02-27 10:00:00'),
(45, 14, 1, '2026-03-18 11:20:00', 30, 'Palpitations and fatigue evaluation',  'Completed', '2026-03-16 10:00:00'),
(46, 17, 1, '2026-04-10 09:00:00', 30, 'Annual cardiac screening',             'Completed', '2026-04-08 10:00:00');

-- 4. Medical records for new appointments
INSERT IGNORE INTO MedicalRecords (record_id, appointment_id, patient_id, doctor_id, diagnosis, treatment, record_date, created_at) VALUES
(21, 41, 2,  1, 'Hypertension Stage 2',              'Amlodipine 5mg added + Lisinopril 10mg continued',     '2026-01-15', '2026-01-15 10:00:00'),
(22, 42, 5,  1, 'Unstable angina — NSTEMI ruled out','Aspirin 300mg loading + Metoprolol 50mg initiated',    '2026-01-22', '2026-01-22 11:00:00'),
(23, 43, 8,  1, 'Paroxysmal atrial fibrillation',    'Metoprolol 100mg + Aspirin 100mg anticoagulation',     '2026-02-05', '2026-02-05 10:00:00'),
(24, 44, 11, 1, 'Post-angioplasty — stable recovery','Aspirin 100mg + Atorvastatin 40mg continued',          '2026-03-01', '2026-03-01 11:00:00'),
(25, 45, 14, 1, 'Supraventricular tachycardia (SVT)','Metoprolol 50mg + rest + follow-up in 4 weeks',        '2026-03-18', '2026-03-18 12:00:00'),
(26, 46, 17, 1, 'Hypertension — well controlled',    'Current regimen effective — Lisinopril 10mg continue', '2026-04-10', '2026-04-10 10:00:00');

-- 5. Prescriptions for new records
INSERT IGNORE INTO Prescriptions (record_id, medication_id, dosage, duration) VALUES
(21, 9,  '10mg',  '30 days'),
(21, 11, '5mg',   '30 days'),
(22, 4,  '300mg', '7 days'),
(22, 12, '50mg',  '30 days'),
(23, 12, '100mg', '30 days'),
(23, 4,  '100mg', '30 days'),
(24, 4,  '100mg', '30 days'),
(24, 8,  '40mg',  '30 days'),
(25, 12, '50mg',  '14 days'),
(26, 9,  '10mg',  '30 days');

-- 6. Billing for new appointments
INSERT IGNORE INTO Billing (bill_id, appointment_id, total_amount, payment_status, billing_date, created_at) VALUES
(21, 41, 280.00, 'Paid',    '2026-01-15', '2026-01-15 10:30:00'),
(22, 42, 350.00, 'Paid',    '2026-01-22', '2026-01-22 11:30:00'),
(23, 43, 400.00, 'Pending', '2026-02-05', '2026-02-05 10:30:00'),
(24, 44, 320.00, 'Paid',    '2026-03-01', '2026-03-01 11:30:00'),
(25, 45, 300.00, 'Paid',    '2026-03-18', '2026-03-18 12:30:00'),
(26, 46, 250.00, 'Failed',  '2026-04-10', '2026-04-10 10:30:00');

-- 7. Radiological results for Doctor 1
INSERT IGNORE INTO RadiologicalResults (result_id, appointment_id, patient_id, doctor_id, image_type, body_part, image_url, findings, result_date, created_at) VALUES
(1, 1,  1,  1, 'X-Ray',               'Chest', '/images/radiology/xray-chest-1.svg',  'Mild cardiomegaly noted. No pulmonary edema or pleural effusion detected.',                  '2026-02-10', '2026-02-10 09:30:00'),
(2, 41, 2,  1, 'ECG',                 'Heart', '/images/radiology/ecg-heart-2.svg',   'Sinus rhythm with occasional premature ventricular complexes. QT interval normal.',         '2026-01-15', '2026-01-15 09:30:00'),
(3, 42, 5,  1, 'CT Scan',             'Chest', '/images/radiology/ct-chest-3.svg',    'No pulmonary embolism detected. Mild pericardial thickening. Aorta within normal limits.', '2026-01-22', '2026-01-22 10:50:00'),
(4, 43, 8,  1, 'Echocardiography',    'Heart', '/images/radiology/echo-heart-4.svg',  'LVEF 52%. Mild mitral regurgitation. No significant wall motion abnormality.',               '2026-02-05', '2026-02-05 10:10:00'),
(5, 44, 11, 1, 'Coronary Angiography','Heart', '/images/radiology/angio-heart-5.svg', 'Previously placed stent patent. No in-stent restenosis. LAD flow TIMI-3.',                  '2026-03-01', '2026-03-01 10:30:00'),
(6, 46, 17, 1, 'X-Ray',               'Chest', '/images/radiology/xray-chest-6.svg',  'Heart size within normal limits. Lung fields clear. No acute cardiopulmonary process.',    '2026-04-10', '2026-04-10 09:30:00');

SELECT 'add_radiology.sql completed successfully.' AS status;
