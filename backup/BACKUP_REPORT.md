# Backup Report

**Date:** 2026-06-06
**Time:** 16:50 (local)
**MySQL version:** 8.0.45 (Win64)

---

## Files Created

| File                                    | Size      | Status  |
|-----------------------------------------|-----------|---------|
| `hospital_db_backup_20260606_1650.sql`  | 543.2 KB  | ✓ OK    |
| `project_backup_20260606_1650.zip`      | 1.41 MB   | ✓ OK    |
| `RESTORE_GUIDE.md`                      | 3.3 KB    | ✓ OK    |
| `database_snapshot.md`                  | 2.1 KB    | ✓ OK    |

All files are located in:
```
hospital-appointment-system/backup/
```

---

## Database Dump Verification

- Tool: `mysqldump 8.0.45`
- Flags: `--single-transaction --routines --triggers --events --add-drop-table --complete-insert`
- Tables captured: 12 (`CREATE TABLE` statements confirmed)
- INSERT blocks: 12 (one per table, extended-insert format)
- File not empty: ✓ (556,229 bytes)

---

## Table Counts at Backup Time

| Table                | Rows  |
|----------------------|------:|
| users                | 1,164 |
| Patients             | 1,031 |
| Doctors              |   122 |
| Appointments         |   706 |
| Billing              |   679 |
| MedicalRecords       |   423 |
| Prescriptions        |   432 |
| RadiologicalResults  |    76 |
| Departments          |    20 |
| Doctor_Departments   |   122 |
| doctor_schedules     |   500 |
| Medications          |   112 |

---

## Project ZIP Contents

- Files archived: 122
- Excludes: `node_modules/`, `dist/`, `build/`, `.git/`, `backup/`
- Includes: all source files, SQL migrations, scripts, public assets, package.json, .env

---

## Safety Check

| Item                     | Result  |
|--------------------------|---------|
| SQL dump exists          | ✓ YES   |
| SQL dump non-empty       | ✓ YES   |
| SQL dump has all tables  | ✓ YES   |
| Project ZIP exists       | ✓ YES   |
| Project ZIP non-empty    | ✓ YES   |
| RESTORE_GUIDE.md exists  | ✓ YES   |
| database_snapshot.md     | ✓ YES   |
| No data modified         | ✓ YES   |
| No schema altered        | ✓ YES   |
| No new records inserted  | ✓ YES   |

---

## Restore Reference

See `RESTORE_GUIDE.md` for step-by-step instructions.

Quick restore:
```bash
mysql -u root -p -e "DROP DATABASE IF EXISTS hospital_db; CREATE DATABASE hospital_db;"
mysql -u root -p hospital_db < hospital_db_backup_20260606_1650.sql
```
