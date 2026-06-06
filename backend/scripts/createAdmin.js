const bcrypt = require('bcrypt');
const db = require('../src/config/db');

const createAdmin = async () => {
    try {
        const adminEmail = 'admin@test.com';
        const adminPassword = '123456';
        const adminRole = 'ADMIN';

        // Check if admin exists
        const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [adminEmail]);

        if (rows.length > 0) {
            console.log('Admin user already exists.');
            process.exit(0);
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(adminPassword, 10);

        // Insert admin
        await db.execute(
            'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
            ['Admin User', adminEmail, hashedPassword, adminRole]
        );

        console.log('Admin user created successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Error creating admin user:', error);
        process.exit(1);
    }
};

createAdmin();
