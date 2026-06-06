-- ============================================================================
-- PRODUCTION-SAFE MIGRATION: 30-minute → 20-minute appointment slots
-- ============================================================================
-- This migration converts the CHECK constraint on appointments.appointment_date
-- from allowing minutes (0, 30) to allowing minutes (0, 20, 40).
--
-- SAFETY: No records are deleted. All steps are non-destructive.
-- RUN EACH SECTION ONE AT A TIME and verify output before proceeding.
-- ============================================================================

USE hospital_db;

-- ============================================================================
-- STEP 1: BACKUP — Create a full copy of the appointments table
-- ============================================================================
-- Run this FIRST. If anything goes wrong, you can restore from this backup.

CREATE TABLE appointments_backup_20260316 AS
SELECT * FROM appointments;

-- Verify backup row count matches original:
SELECT
    (SELECT COUNT(*) FROM appointments) AS original_count,
    (SELECT COUNT(*) FROM appointments_backup_20260316) AS backup_count;


-- ============================================================================
-- STEP 2: IDENTIFY — Find all appointments with non-compliant minutes
-- ============================================================================
-- This shows every record whose minute is NOT in (0, 20, 40).
-- Review this output carefully before proceeding.

SELECT
    id,
    patient_id,
    doctor_id,
    appointment_date,
    MINUTE(appointment_date) AS current_minute,
    status,
    reason
FROM appointments
WHERE MINUTE(appointment_date) NOT IN (0, 20, 40)
ORDER BY doctor_id, appointment_date;


-- ============================================================================
-- STEP 3: CONFLICT DETECTION — Check if converting :30 → :20 would collide
-- ============================================================================
-- For each :30 appointment, we check whether a :20 appointment already exists
-- for the same doctor on the same date+hour. If this returns rows, those
-- records need manual resolution BEFORE the UPDATE in Step 4.

SELECT
    a.id           AS conflicting_30min_id,
    a.doctor_id,
    a.patient_id   AS patient_30min,
    a.appointment_date AS current_datetime_30,
    DATE_FORMAT(
        DATE_SUB(a.appointment_date, INTERVAL 10 MINUTE),
        '%Y-%m-%d %H:%i:%s'
    ) AS proposed_datetime_20,
    b.id           AS existing_20min_id,
    b.patient_id   AS patient_20min,
    b.appointment_date AS existing_datetime_20
FROM appointments a
JOIN appointments b
    ON  a.doctor_id = b.doctor_id
    AND b.appointment_date = DATE_SUB(a.appointment_date, INTERVAL 10 MINUTE)
WHERE MINUTE(a.appointment_date) = 30;

-- IF THIS RETURNS 0 ROWS  → No conflicts. Proceed to Step 4.
-- IF THIS RETURNS ROWS     → STOP. Resolve conflicts manually first.
--                            See CONFLICT RESOLUTION section below.


-- ============================================================================
-- STEP 4: SAFE UPDATE — Convert :30 appointments to :20 (only if no conflicts)
-- ============================================================================
-- ONLY RUN THIS IF STEP 3 RETURNED ZERO ROWS.
-- This shifts all :30 appointments back by 10 minutes to :20.

UPDATE appointments
SET appointment_date = DATE_SUB(appointment_date, INTERVAL 10 MINUTE)
WHERE MINUTE(appointment_date) = 30;

-- Verify: This should now return 0 rows
SELECT id, appointment_date, MINUTE(appointment_date) AS minute_value
FROM appointments
WHERE MINUTE(appointment_date) NOT IN (0, 20, 40);


-- ============================================================================
-- STEP 5: UPDATE CHECK CONSTRAINT
-- ============================================================================
-- Only run this AFTER Step 4 confirms zero non-compliant rows.

-- Drop the old constraint (handles the name used in the live DB)
ALTER TABLE appointments DROP CHECK chk_valid_time_slot;

-- Add the correct 20-minute constraint
ALTER TABLE appointments
ADD CONSTRAINT chk_valid_time_slot
CHECK (MINUTE(appointment_date) IN (0, 20, 40));


-- ============================================================================
-- STEP 6: POST-MIGRATION VERIFICATION
-- ============================================================================

-- 6a. Confirm constraint exists and is correct
SELECT
    CONSTRAINT_NAME,
    CHECK_CLAUSE
FROM INFORMATION_SCHEMA.CHECK_CONSTRAINTS
WHERE CONSTRAINT_SCHEMA = 'hospital_db'
  AND CONSTRAINT_NAME = 'chk_valid_time_slot';

-- 6b. Confirm all appointment minutes are valid
SELECT
    MINUTE(appointment_date) AS minute_value,
    COUNT(*) AS count
FROM appointments
GROUP BY minute_value
ORDER BY minute_value;
-- Expected output: only rows with minute_value 0, 20, or 40

-- 6c. Confirm no data was lost
SELECT
    (SELECT COUNT(*) FROM appointments) AS current_count,
    (SELECT COUNT(*) FROM appointments_backup_20260316) AS backup_count;
-- Both counts must be equal

-- 6d. Test: This INSERT should SUCCEED
-- INSERT INTO appointments (patient_id, doctor_id, appointment_date, reason)
-- VALUES (1, 1, '2099-01-01 11:20:00', 'Migration test - delete after');

-- 6e. Test: This INSERT should FAIL with CHECK constraint violation
-- INSERT INTO appointments (patient_id, doctor_id, appointment_date, reason)
-- VALUES (1, 1, '2099-01-01 11:30:00', 'Migration test - should fail');


-- ============================================================================
-- CONFLICT RESOLUTION (only needed if Step 3 returned rows)
-- ============================================================================
-- If a :30 appointment would collide with an existing :20 appointment for
-- the same doctor, you have several options:
--
-- Option A: Move the :30 appointment to :40 instead of :20
--   UPDATE appointments
--   SET appointment_date = DATE_ADD(appointment_date, INTERVAL 10 MINUTE)
--   WHERE id = <conflicting_30min_id>;
--
-- Option B: Move the :30 appointment to the next available slot
--   First check what's free:
--   SELECT appointment_date FROM appointments
--   WHERE doctor_id = <doctor_id>
--     AND DATE(appointment_date) = '<date>'
--   ORDER BY appointment_date;
--
--   Then update to an open 20-min slot:
--   UPDATE appointments
--   SET appointment_date = '<available_slot>'
--   WHERE id = <conflicting_30min_id>;
--
-- Option C: If the :30 appointment is CANCELLED, it can safely be moved
--   to any valid slot since it won't affect active scheduling.
--
-- After resolving all conflicts, re-run Step 3 to confirm 0 rows,
-- then proceed to Step 4.


-- ============================================================================
-- ROLLBACK (emergency only)
-- ============================================================================
-- If something goes wrong after Step 4, restore from backup:
--
-- TRUNCATE TABLE appointments;
-- INSERT INTO appointments SELECT * FROM appointments_backup_20260316;
--
-- Then re-add the OLD constraint:
-- ALTER TABLE appointments DROP CHECK chk_valid_time_slot;
-- ALTER TABLE appointments ADD CONSTRAINT chk_valid_time_slot
--   CHECK (MINUTE(appointment_date) IN (0, 30));
