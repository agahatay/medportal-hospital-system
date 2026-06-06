# Database Snapshot — 2026-06-06 16:50

## Connection
- Host: localhost
- Database: hospital_db
- Engine: MySQL 8.0.45

## Table Row Counts

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

## Schema Summary

### Billing (relevant to recent changes)
| Column         | Type            | Nullable | Default   |
|----------------|-----------------|----------|-----------|
| bill_id        | int             | NO       | —         |
| appointment_id | int             | NO       | —         |
| total_amount   | decimal(10,2)   | YES      | —         |
| payment_status | enum(Paid,Pending,Failed) | YES | Pending |
| payment_method | varchar(20)     | NO       | Online    |
| billing_date   | date            | YES      | —         |
| payment_date   | datetime        | YES      | —         |
| updated_at     | timestamp       | YES      | —         |
| created_at     | timestamp       | YES      | CURRENT_TIMESTAMP |

### Appointments
| Column           | Type      | Nullable | Default    |
|------------------|-----------|----------|------------|
| appointment_id   | int       | NO       | —          |
| patient_id       | int       | NO       | —          |
| doctor_id        | int       | NO       | —          |
| appointment_date | datetime  | NO       | —          |
| duration         | int       | YES      | —          |
| reason           | text      | YES      | —          |
| status           | enum(Scheduled,Completed,Cancelled,No_Show) | NO | Scheduled |
| created_at       | timestamp | YES      | CURRENT_TIMESTAMP |

## Notes
- `payment_method` column was added via migration on 2026-06-06.
- All pre-existing billing rows default to `payment_method = 'Online'`.
- Snapshot taken before any further development changes.
