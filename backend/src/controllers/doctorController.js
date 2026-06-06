const db = require('../config/db');
const bcrypt = require('bcrypt');

exports.getAllDoctors = async (req, res) => {
    const { department_id } = req.query;
    let query = `
        SELECT d.doctor_id, d.user_id, d.first_name, d.last_name,
               CONCAT(d.first_name, ' ', d.last_name) AS name,
               d.specialization, d.phone, d.email, d.bio,
               u.email AS user_email,
               dept.name AS department_name, dd.department_id
        FROM Doctors d
        JOIN users u ON d.user_id = u.id
        LEFT JOIN Doctor_Departments dd ON d.doctor_id = dd.doctor_id
        LEFT JOIN Departments dept ON dd.department_id = dept.department_id
    `;
    const params = [];

    if (department_id) {
        query += ' WHERE dd.department_id = ?';
        params.push(department_id);
    }

    try {
        const [rows] = await db.execute(query, params);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching doctors' });
    }
};

exports.createDoctor = async (req, res) => {
    const { first_name, last_name, name, email, password, specialization, department_id, phone, bio } = req.body;

    let fName = first_name;
    let lName = last_name;
    if (!fName && !lName && name) {
        const parts = name.trim().split(' ');
        fName = parts[0];
        lName = parts.slice(1).join(' ') || parts[0];
    }

    if (!fName || !lName || !email || !password) {
        return res.status(400).json({ message: 'first_name, last_name, email, and password are required' });
    }

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const hashedPassword = await bcrypt.hash(password, 10);
        const [userResult] = await connection.execute(
            'INSERT INTO users (email, password, role) VALUES (?, ?, ?)',
            [email, hashedPassword, 'DOCTOR']
        );
        const userId = userResult.insertId;

        const [doctorResult] = await connection.execute(
            'INSERT INTO Doctors (user_id, first_name, last_name, specialization, phone, email, bio) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [userId, fName, lName, specialization || null, phone || null, email, bio || null]
        );
        const doctorId = doctorResult.insertId;

        if (department_id) {
            await connection.execute(
                'INSERT INTO Doctor_Departments (doctor_id, department_id) VALUES (?, ?)',
                [doctorId, department_id]
            );
        }

        await connection.commit();
        res.status(201).json({ message: 'Doctor created successfully', id: doctorId });
    } catch (error) {
        await connection.rollback();
        console.error(error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'A user with this email already exists' });
        }
        res.status(500).json({ message: 'Error creating doctor' });
    } finally {
        connection.release();
    }
};

exports.updateDoctor = async (req, res) => {
    const { id } = req.params;
    const { first_name, last_name, name, specialization, department_id, phone, bio } = req.body;

    let fName = first_name;
    let lName = last_name;
    if (!fName && !lName && name) {
        const parts = name.trim().split(' ');
        fName = parts[0];
        lName = parts.slice(1).join(' ') || parts[0];
    }

    if (!fName || !lName) {
        return res.status(400).json({ message: 'first_name and last_name are required' });
    }

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // Update Doctors table
        await connection.execute(
            `UPDATE Doctors SET first_name = ?, last_name = ?, specialization = ?, phone = ?, bio = ?
             WHERE doctor_id = ?`,
            [fName, lName, specialization || null, phone || null, bio || null, id]
        );

        // Update department: remove old, insert new (if provided)
        await connection.execute('DELETE FROM Doctor_Departments WHERE doctor_id = ?', [id]);
        if (department_id) {
            await connection.execute(
                'INSERT INTO Doctor_Departments (doctor_id, department_id) VALUES (?, ?)',
                [id, department_id]
            );
        }

        await connection.commit();
        res.json({ message: 'Doctor updated successfully' });
    } catch (error) {
        await connection.rollback();
        console.error(error);
        res.status(500).json({ message: 'Error updating doctor' });
    } finally {
        connection.release();
    }
};

exports.deleteDoctor = async (req, res) => {
    const { id } = req.params;

    try {
        const [doctorRows] = await db.execute(
            'SELECT doctor_id, user_id FROM Doctors WHERE doctor_id = ?', [id]
        );
        if (doctorRows.length === 0) {
            return res.status(404).json({ message: 'Doctor not found' });
        }

        const [apptRows] = await db.execute(
            'SELECT COUNT(*) AS count FROM Appointments WHERE doctor_id = ?', [id]
        );
        if (apptRows[0].count > 0) {
            return res.status(409).json({
                message: 'Cannot delete doctor: they have existing appointments. Cancel the appointments first.'
            });
        }

        // Deleting the user cascades to delete the doctor record via FK
        await db.execute('DELETE FROM users WHERE id = ?', [doctorRows[0].user_id]);

        res.json({ message: 'Doctor deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error deleting doctor' });
    }
};
