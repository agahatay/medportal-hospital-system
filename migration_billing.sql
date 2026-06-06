

USE hospital_db;


ALTER TABLE Billing
    ADD COLUMN IF NOT EXISTS payment_date DATETIME NULL AFTER billing_date,
    ADD COLUMN IF NOT EXISTS updated_at   TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP AFTER payment_date;


UPDATE Billing
SET payment_date = DATE_ADD(billing_date, INTERVAL 1 DAY)
WHERE payment_status = 'Paid'
  AND payment_date IS NULL;


SELECT bill_id, payment_status, billing_date, payment_date
FROM   Billing
ORDER  BY bill_id;
