# Hospital Appointment System

A comprehensive web-based appointment management system featuring three distinct portals: Patient, Doctor, and Admin.

## Features

- **Patient Portal**: Register/Login, Search Doctors by Department, Book Appointments, View Appointment History.
- **Doctor Portal**: Manage Schedule, View Upcoming Appointments, Complete/Cancel Appointments, Profile.
- **Admin Portal**: Dashboard Overview, Manage Doctors (Add/Edit/Delete), Manage Departments, View All System Appointments.

## Tech Stack

- **Frontend**: React (Vite)
- **Styling**: Plain CSS (Custom Design System)
- **Routing**: React Router DOM (Role-based Protected Routes)
- **Icons**: Lucide React

## Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Run Application**
   ```bash
   npm run dev
   ```

3. **Access Portals**
   - The app uses a unified login page.
   - Use the **Demo Buttons** on the login page to quickly switch between Patient, Doctor, and Admin accounts.

## Mock Data
The application uses an in-memory mock API layer (`src/api`) to simulate backend interactions. Data changes (like booking an appointment) persist in local state during the session.
