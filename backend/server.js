const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const bcrypt = require('bcrypt');
const db = require('./src/config/db');

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
    res.send('Backend is running');
});

app.get('/api/health', (req, res) => {
    res.json({ ok: true });
});

app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/departments', require('./src/routes/departmentRoutes'));
app.use('/api/doctors', require('./src/routes/doctorRoutes'));
app.use('/api/appointments', require('./src/routes/appointmentRoutes'));
app.use('/api/admin',   require('./src/routes/adminRoutes'));
app.use('/api/doctor',  require('./src/routes/doctorDashboardRoutes'));
app.use('/api/patient', require('./src/routes/patientDashboardRoutes'));
app.use('/api/billing', require('./src/routes/billingRoutes'));


// Admin Bootstrap
const createAdmin = async () => {
    try {
        const adminEmail = 'admin@test.com';
        const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [adminEmail]);

        if (rows.length > 0) {
            console.log('Admin bootstrap: Admin user ALREADY EXISTS.');
            console.log('Admin details:', { id: rows[0].id, email: rows[0].email, role: rows[0].role });
            return;
        }

        console.log('Admin bootstrap: Admin user NOT found. Creating...');
        const hashedPassword = await bcrypt.hash('123456', 10);
        await db.execute(
            'INSERT INTO users (email, password, role) VALUES (?, ?, ?)',
            [adminEmail, hashedPassword, 'ADMIN']
        );
        console.log('Admin bootstrap: Admin user created successfully.');
    } catch (error) {
        console.error('Admin bootstrap failed:', error);
    }
};

app.listen(PORT, async () => {
    await createAdmin();
    console.log(`Server running on http://localhost:${PORT}`);
});
