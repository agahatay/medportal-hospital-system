# Restore Guide

Backup date: 2026-06-06 16:50
MySQL version: 8.0.45

---

## 1. Restore the Database

### Prerequisites
- MySQL 8.x running
- `mysql` CLI available in PATH
- Database user with CREATE / DROP privileges

### Steps

```bash
# 1. Connect to MySQL and recreate the database (all existing data will be lost)
mysql -h localhost -u root -p -e "DROP DATABASE IF EXISTS hospital_db; CREATE DATABASE hospital_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 2. Restore the dump
mysql -h localhost -u root -p hospital_db < hospital_db_backup_20260606_1650.sql

# 3. Verify row counts match the snapshot
mysql -h localhost -u root -p hospital_db -e "
  SELECT 'users'               AS tbl, COUNT(*) AS rows FROM users         UNION ALL
  SELECT 'Patients',                    COUNT(*)         FROM Patients      UNION ALL
  SELECT 'Doctors',                     COUNT(*)         FROM Doctors       UNION ALL
  SELECT 'Appointments',                COUNT(*)         FROM Appointments  UNION ALL
  SELECT 'Billing',                     COUNT(*)         FROM Billing       UNION ALL
  SELECT 'MedicalRecords',              COUNT(*)         FROM MedicalRecords UNION ALL
  SELECT 'Prescriptions',               COUNT(*)         FROM Prescriptions UNION ALL
  SELECT 'RadiologicalResults',         COUNT(*)         FROM RadiologicalResults;
"
```

Expected counts are in `database_snapshot.md`.

---

## 2. Restore Project Files

### From the ZIP

```bash
# Windows (PowerShell)
Expand-Archive -Path "backup\project_backup_20260606_1650.zip" -DestinationPath "C:\restored-project"

# Linux / macOS
unzip backup/project_backup_20260606_1650.zip -d /path/to/restored-project
```

> The ZIP contains the full project tree (frontend + backend) minus node_modules, dist, build, and .git.

---

## 3. Reinstall Dependencies

```bash
# Backend
cd restored-project/backend
npm install

# Frontend (root)
cd restored-project
npm install
```

---

## 4. Configure Environment

The `.env` file for the backend is included in the ZIP. Verify or recreate:

```
# backend/.env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=admin123
DB_NAME=hospital_db
PORT=5000
JWT_SECRET=dev_secret_key
```

> Change credentials before deploying to production.

---

## 5. Start the Backend

```bash
cd restored-project/backend
npm run dev          # nodemon (development)
# or
node server.js       # plain Node
```

Backend listens on: `http://localhost:5000`

---

## 6. Start the Frontend

```bash
cd restored-project
npm run dev          # Vite dev server
```

Frontend runs at: `http://localhost:5173`

---

## 7. Verify the App

| Test                         | Expected result                          |
|------------------------------|------------------------------------------|
| `GET /api/admin/stats`       | 200 with stats JSON                      |
| Login as `admin@test.com`    | JWT returned, redirects to admin portal  |
| Login as `patient01@test.com`| Redirects to patient portal              |
| Patient Billing page         | Bills listed, payment modal works        |

Default test accounts (password `123456`):
- `admin@test.com`
- `doctor01@test.com`
- `patient01@test.com`

---

## 8. Re-seed Mock Data (optional)

If the mock data (1 000 patients, 100 doctors) needs to be regenerated:

```bash
cd restored-project/backend
npm run seed:mock
```

> Safe to re-run — all inserts use explicit IDs and `INSERT IGNORE`.
