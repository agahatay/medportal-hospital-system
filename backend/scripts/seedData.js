const bcrypt = require('bcrypt');
const db = require('../src/config/db');

const departments = [
    { name: 'Cardiology', description: 'Heart and cardiovascular system care' },
    { name: 'Neurology', description: 'Disorders of the nervous system' },
    { name: 'Dermatology', description: 'Skin, hair, and nail conditions' },
    { name: 'Pediatrics', description: 'Medical care of infants, children, and adolescents' },
    { name: 'Orthopedics', description: 'Care for the musculoskeletal system' }
];

const doctors = [
    { name: 'Dr. Sarah Connor', email: 'doctor1@test.com', dept: 'Cardiology', spec: 'Interventional Cardiology' },
    { name: 'Dr. Emmet Brown', email: 'doctor2@test.com', dept: 'Neurology', spec: 'Neurophysiology' },
    { name: 'Dr. Gregory House', email: 'doctor3@test.com', dept: 'Dermatology', spec: 'Diagnostic Medicine' },
    { name: 'Dr. Stephen Strange', email: 'doctor4@test.com', dept: 'Neurology', spec: 'Neurosurgery' },
    { name: 'Dr. Meredith Grey', email: 'doctor5@test.com', dept: 'Cardiology', spec: 'General Surgery' },
    { name: 'Dr. John Watson', email: 'doctor6@test.com', dept: 'Pediatrics', spec: 'General Practice' },
    { name: 'Dr. Leonard McCoy', email: 'doctor7@test.com', dept: 'Orthopedics', spec: 'Space Medicine' },
    { name: 'Dr. Beverly Crusher', email: 'doctor8@test.com', dept: 'Pediatrics', spec: 'Chief Medical Officer' }
];

const patients = Array.from({ length: 10 }, (_, i) => ({
    name: `Patient ${i + 1}`,
    email: `patient${i + 1}@test.com`,
    phone: `555-01${String(i).padStart(2, '0')}`,
    address: `${100 + i} Fake St, City ${i}`,
    dob: `19${80 + (i % 20)}-01-15`,
    gender: i % 2 === 0 ? 'MALE' : 'FEMALE'
}));

const statuses = ['SCHEDULED', 'COMPLETED', 'CANCELLED'];
const reasons = ['Regular Checkup', 'Follow-up', 'Consultation', 'Emergency', 'Routine Exam'];

const seed = async () => {
    try {
        console.log('Starting seed process...');

        // 1. Clear Data (Order implies FK constraints)
        console.log('Clearing old data...');
        await db.execute('DELETE FROM appointments');
        await db.execute('DELETE FROM doctors');
        await db.execute('DELETE FROM patients');
        await db.execute('DELETE FROM departments'); // Reset IDs often safer
        await db.execute('DELETE FROM users'); // Triggers cascade to docs/patients usually, but manual delete safe

        // 2. Departments
        const deptMap = {};
        for (const dept of departments) {
            const [res] = await db.execute('INSERT INTO departments (name, description) VALUES (?, ?)', [dept.name, dept.description]);
            deptMap[dept.name] = res.insertId;
        }
        console.log(`Inserted ${departments.length} departments.`);

        const hashedPassword = await bcrypt.hash('123456', 10);

        // 3. Admin
        await db.execute(
            'INSERT INTO users (email, password, role) VALUES (?, ?, ?)',
            ['admin@test.com', hashedPassword, 'ADMIN']
        );
        console.log('Inserted Admin user.');

        // 4. Doctors
        const doctorIds = [];
        for (const doc of doctors) {
            // Create user
            const [uRes] = await db.execute(
                'INSERT INTO users (email, password, role) VALUES (?, ?, ?)',
                [doc.email, hashedPassword, 'DOCTOR']
            );
            const userId = uRes.insertId;

            // Create doctor profile
            const [dRes] = await db.execute(
                'INSERT INTO doctors (user_id, department_id, name, specialization, phone, bio) VALUES (?, ?, ?, ?, ?, ?)',
                [userId, deptMap[doc.dept], doc.name, doc.spec, '555-DOC-00', `Bio for ${doc.name}`]
            );
            doctorIds.push(dRes.insertId);
        }
        console.log(`Inserted ${doctors.length} doctors.`);

        // 5. Patients
        const patientIds = [];
        for (const pat of patients) {
            const [uRes] = await db.execute(
                'INSERT INTO users (email, password, role) VALUES (?, ?, ?)',
                [pat.email, hashedPassword, 'PATIENT']
            );
            const userId = uRes.insertId;

            const [pRes] = await db.execute(
                'INSERT INTO patients (user_id, name, phone, address, date_of_birth, gender) VALUES (?, ?, ?, ?, ?, ?)',
                [userId, pat.name, pat.phone, pat.address, pat.dob, pat.gender]
            );
            patientIds.push(pRes.insertId);
        }
        console.log(`Inserted ${patients.length} patients.`);

        // 6. Appointments
        // Generate current date base
        const now = new Date();
        const appointmentsToCreate = 20;

        for (let i = 0; i < appointmentsToCreate; i++) {
            const patId = patientIds[Math.floor(Math.random() * patientIds.length)];
            const docId = doctorIds[Math.floor(Math.random() * doctorIds.length)];
            const status = statuses[Math.floor(Math.random() * statuses.length)];
            const reason = reasons[Math.floor(Math.random() * reasons.length)];

            // Random date: +/- 10 days
            const dayOffset = Math.floor(Math.random() * 20) - 10;
            const appDate = new Date(now);
            appDate.setDate(appDate.getDate() + dayOffset);
            appDate.setHours(9 + Math.floor(Math.random() * 8), 0, 0, 0); // 9am - 5pm

            // Format for MySQL DATETIME: YYYY-MM-DD HH:MM:SS
            const dateStr = appDate.toISOString().slice(0, 19).replace('T', ' ');

            await db.execute(
                'INSERT INTO appointments (patient_id, doctor_id, appointment_date, status, reason) VALUES (?, ?, ?, ?, ?)',
                [patId, docId, dateStr, status, reason]
            );
        }
        console.log(`Inserted ${appointmentsToCreate} appointments.`);

        console.log('Seed completed successfully.');
        process.exit(0);

    } catch (err) {
        console.error('Seed error:', err);
        process.exit(1);
    }
};

seed();
