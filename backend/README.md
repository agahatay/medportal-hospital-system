# Hospital Appointment System Backend

Node.js Express backend for the Hospital Appointment System keying off a MySQL database.

## Prerequisites

- Node.js installed
- MySQL Server running
- Database `hospital_db` created with schema from `../schema.sql`

## Setup

1.  **Install Dependencies**
    ```bash
    cd backend
    npm install
    ```

2.  **Environment Configuration**
    - The `.env` file is pre-configured for local development.
    - Update `DB_PASSWORD` in `.env` if your local MySQL root user has a password.

3.  **Run Server**
    ```bash
    npm run dev
    ```
    Server starts on `http://localhost:5000`.

## Admin User Bootstrap
The server automatically checks for an admin user (`admin@test.com`) on startup.
- If missing, it creates the user with password `123456`.
- If exists, it logs "Admin already exists".

To manually trigger this check or create the admin user via script:
```bash
npm run create-admin
```

## API Endpoints

### Auth
- `POST /api/auth/register` - { email, password, role }
- `POST /api/auth/login` - { email, password }

### Resource
- `GET /api/departments` (Auth required)
- `GET /api/doctors?department_id=ID` (Auth required)
- `POST /api/appointments` (Patient only)
- `GET /api/appointments` (Auth required, filtered by role)
- `PATCH /api/appointments/:id/status` (Admin/Doctor only)
