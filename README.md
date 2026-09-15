# Hospital Appointment System

A full-stack hospital appointment management system designed to streamline interactions between patients, doctors, and administrators.

The application provides separate portals for each user role, allowing patients to book appointments, doctors to manage their schedules, and administrators to manage doctors, departments, and appointments.

## Features

### Patient Portal

- User registration and login
- Search doctors by department
- View doctor information
- Book appointments
- View appointment history
- Manage appointments

### Doctor Portal

- Doctor login and authentication
- Manage availability and schedule
- View upcoming appointments
- Complete appointments
- Cancel appointments
- Manage doctor profile

### Admin Portal

- Dashboard overview
- Manage doctors
- Add, edit, and delete doctors
- Manage departments
- View and manage all appointments
- Manage system data

## Tech Stack

### Frontend

- React
- Vite
- JavaScript
- React Router DOM
- CSS
- Lucide React

### Backend

- Node.js
- Express.js
- REST API
- MySQL
- dotenv

### Database

- MySQL
- SQL
- Database migrations
- Seed data

## Project Architecture

The application follows a separated frontend and backend architecture:

```text
                    Hospital Appointment System

                              │
                ┌─────────────┴─────────────┐
                │                           │
          React Frontend              Node.js Backend
                │                           │
        React Router DOM               Express.js
                │                           │
                └─────────────┬─────────────┘
                              │
                         REST API
                              │
                              ▼
                         MySQL Database
```

## Project Structure

```text
medportal-hospital-system/
│
├── backend/
│   ├── migrations/
│   ├── scripts/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   └── routes/
│   ├── utils/
│   ├── package.json
│   ├── seed.sql
│   └── server.js
│
├── public/
├── src/
├── backup/
│
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── package-lock.json
├── vite.config.js
└── README.md
```

## User Roles

| Role | Responsibilities |
|------|------------------|
| Patient | Search doctors, book appointments, and view appointment history |
| Doctor | Manage availability, schedules, and appointments |
| Admin | Manage doctors, departments, and system appointments |

## Getting Started

### Prerequisites

Make sure you have the following installed:

- Node.js
- npm
- MySQL

### 1. Clone the Repository

```bash
git clone https://github.com/agahatay/medportal-hospital-system.git
cd medportal-hospital-system
```

### 2. Install Frontend Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the `backend` directory based on `.env.example`.

Example configuration:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=hospital_db
PORT=3000
```

> Do not commit your `.env` file or real credentials to the repository.

### 4. Configure the Database

Create a MySQL database and configure the connection using the environment variables.

SQL schema, migration, and seed files are included in the repository.

### 5. Start the Backend

Navigate to the backend directory:

```bash
cd backend
npm install
```

Start the backend server:

```bash
node server.js
```

### 6. Start the Frontend

Open a new terminal and return to the project root:

```bash
cd ..
npm run dev
```

The frontend will be available through the local development server provided by Vite.

## Database

The application uses MySQL for data persistence.

The repository includes database-related resources such as:

- Database schema
- Migration scripts
- Seed data
- Entity relationship diagram

## Security

Environment-specific configuration is managed through environment variables.

Sensitive credentials such as database passwords should be stored in `.env` and should never be committed to the repository.

## Future Improvements

Possible future improvements include:

- Online deployment
- Email notifications
- SMS appointment reminders
- Advanced appointment filtering
- Doctor availability calendar
- Improved reporting and analytics
- Automated testing
- Containerized deployment with Docker

## Project Purpose

This project was developed as a graduation project to demonstrate full-stack web development, REST API development, role-based access control, database management, and frontend/backend integration.

## License

This project is intended for educational and portfolio purposes.
