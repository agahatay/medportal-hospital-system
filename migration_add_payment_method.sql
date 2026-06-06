USE hospital_db;

-- Add payment_method column to track Online vs Cash payments.
-- Existing bills default to 'Online' for backward compatibility.
-- Safe to run multiple times: checks INFORMATION_SCHEMA before altering.
SET @col_exists = (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME   = 'Billing'
      AND COLUMN_NAME  = 'payment_method'
);

SET @sql = IF(@col_exists = 0,
    "ALTER TABLE Billing ADD COLUMN payment_method VARCHAR(20) NOT NULL DEFAULT 'Online' AFTER payment_status",
    "SELECT 'payment_method column already exists — skipping' AS note"
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
