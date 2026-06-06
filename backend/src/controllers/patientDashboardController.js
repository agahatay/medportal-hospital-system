const db = require('../config/db');

const resolvePatientId = async (req) => {
    const [rows] = await db.execute('SELECT patient_id FROM Patients WHERE user_id = ?', [req.user.id]);
    return rows.length > 0 ? rows[0].patient_id : null;
};

// GET /api/patient/doctors
exports.getDoctors = async (req, res) => {
    const { department_id } = req.query;
    let query = `
        SELECT d.doctor_id, d.first_name, d.last_name,
               CONCAT(d.first_name, ' ', d.last_name) AS name,
               d.specialization, d.phone, d.bio,
               dept.name AS department_name, dd.department_id
        FROM Doctors d
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

// GET /api/patient/doctors/:doctor_id
exports.getDoctorById = async (req, res) => {
    const { doctor_id } = req.params;
    try {
        const [rows] = await db.execute(`
            SELECT d.doctor_id, d.first_name, d.last_name,
                   CONCAT(d.first_name, ' ', d.last_name) AS name,
                   d.specialization, d.phone, d.bio,
                   dept.name AS department_name, dd.department_id
            FROM Doctors d
            LEFT JOIN Doctor_Departments dd ON d.doctor_id = dd.doctor_id
            LEFT JOIN Departments dept ON dd.department_id = dept.department_id
            WHERE d.doctor_id = ?
        `, [doctor_id]);
        if (rows.length === 0) return res.status(404).json({ message: 'Doctor not found' });
        res.json(rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching doctor' });
    }
};

// GET /api/patient/medical-records
exports.getMedicalRecords = async (req, res) => {
    try {
        const patientId = await resolvePatientId(req);
        if (!patientId) return res.status(404).json({ message: 'Patient profile not found' });

        const [rows] = await db.execute(`
            SELECT mr.record_id,
                   mr.diagnosis,
                   mr.treatment,
                   mr.record_date,
                   a.appointment_id,
                   a.appointment_date,
                   CONCAT(d.first_name, ' ', d.last_name) AS doctor_name,
                   d.specialization AS doctor_specialization
            FROM MedicalRecords mr
            JOIN Appointments a ON mr.appointment_id = a.appointment_id
            JOIN Doctors d      ON mr.doctor_id       = d.doctor_id
            WHERE mr.patient_id = ?
            ORDER BY mr.record_date DESC
        `, [patientId]);

        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching medical records' });
    }
};

// GET /api/patient/prescriptions
exports.getPrescriptions = async (req, res) => {
    try {
        const patientId = await resolvePatientId(req);
        if (!patientId) return res.status(404).json({ message: 'Patient profile not found' });

        const [rows] = await db.execute(`
            SELECT pr.prescription_id,
                   pr.dosage,
                   pr.duration           AS prescription_duration,
                   med.name              AS medication_name,
                   mr.record_id,
                   mr.diagnosis,
                   mr.record_date,
                   a.appointment_id,
                   a.appointment_date,
                   CONCAT(d.first_name, ' ', d.last_name) AS doctor_name
            FROM Prescriptions pr
            JOIN MedicalRecords mr ON pr.record_id      = mr.record_id
            JOIN Medications   med ON pr.medication_id  = med.medication_id
            JOIN Appointments    a ON mr.appointment_id = a.appointment_id
            JOIN Doctors         d ON mr.doctor_id      = d.doctor_id
            WHERE mr.patient_id = ?
            ORDER BY a.appointment_date DESC, pr.prescription_id ASC
        `, [patientId]);

        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching prescriptions' });
    }
};

// GET /api/patient/medications
exports.getMedications = async (req, res) => {
    try {
        const patientId = await resolvePatientId(req);
        if (!patientId) return res.status(404).json({ message: 'Patient profile not found' });

        const [rows] = await db.execute(`
            SELECT med.medication_id,
                   med.name              AS medication_name,
                   pr.dosage,
                   pr.duration,
                   mr.diagnosis,
                   mr.record_date,
                   a.appointment_date,
                   CONCAT(d.first_name, ' ', d.last_name) AS doctor_name
            FROM Medications med
            JOIN Prescriptions pr ON med.medication_id  = pr.medication_id
            JOIN MedicalRecords mr ON pr.record_id       = mr.record_id
            JOIN Appointments    a ON mr.appointment_id  = a.appointment_id
            JOIN Doctors         d ON mr.doctor_id       = d.doctor_id
            WHERE mr.patient_id = ?
            ORDER BY a.appointment_date DESC
        `, [patientId]);

        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching medications' });
    }
};

// GET /api/patient/profile
exports.getProfile = async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT p.patient_id,
                   p.first_name,
                   p.last_name,
                   CONCAT(p.first_name, ' ', p.last_name) AS full_name,
                   p.date_of_birth,
                   p.gender,
                   p.phone,
                   p.address,
                   u.email,
                   u.role
            FROM Patients p
            JOIN users u ON p.user_id = u.id
            WHERE p.user_id = ?
        `, [req.user.id]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Patient profile not found' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching profile' });
    }
};

// PUT /api/patient/profile
exports.updateProfile = async (req, res) => {
    const { first_name, last_name, phone, gender, date_of_birth, address } = req.body;

    if (!first_name || !String(first_name).trim()) {
        return res.status(400).json({ message: 'First name is required' });
    }
    if (!last_name || !String(last_name).trim()) {
        return res.status(400).json({ message: 'Last name is required' });
    }
    if (phone && !/^\+?[\d\s\-(). ]{7,20}$/.test(phone)) {
        return res.status(400).json({ message: 'Invalid phone number format' });
    }
    if (date_of_birth) {
        const d = new Date(date_of_birth);
        if (isNaN(d.getTime())) {
            return res.status(400).json({ message: 'Invalid date of birth' });
        }
        if (d > new Date()) {
            return res.status(400).json({ message: 'Date of birth cannot be in the future' });
        }
    }

    try {
        const result = await db.execute(
            `UPDATE Patients
             SET first_name = ?, last_name = ?, phone = ?, gender = ?, date_of_birth = ?, address = ?
             WHERE user_id = ?`,
            [
                first_name.trim(),
                last_name.trim(),
                phone   || null,
                gender  || null,
                date_of_birth || null,
                address || null,
                req.user.id
            ]
        );

        if (result[0].affectedRows === 0) {
            return res.status(404).json({ message: 'Patient profile not found' });
        }

        const [rows] = await db.execute(`
            SELECT p.patient_id,
                   p.first_name,
                   p.last_name,
                   CONCAT(p.first_name, ' ', p.last_name) AS full_name,
                   p.date_of_birth,
                   p.gender,
                   p.phone,
                   p.address,
                   u.email,
                   u.role
            FROM Patients p
            JOIN users u ON p.user_id = u.id
            WHERE p.user_id = ?
        `, [req.user.id]);

        res.json(rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating profile' });
    }
};

// GET /api/patient/radiological-results
exports.getRadiologicalResults = async (req, res) => {
    try {
        const patientId = await resolvePatientId(req);
        if (!patientId) return res.status(404).json({ message: 'Patient profile not found' });

        const [rows] = await db.execute(`
            SELECT rr.result_id,
                   rr.image_type,
                   rr.body_part,
                   rr.image_url,
                   rr.findings,
                   rr.result_date,
                   a.appointment_id,
                   a.appointment_date,
                   CONCAT(d.first_name, ' ', d.last_name) AS doctor_name,
                   d.specialization AS doctor_specialization
            FROM RadiologicalResults rr
            JOIN Appointments a ON rr.appointment_id = a.appointment_id
            JOIN Doctors       d ON rr.doctor_id      = d.doctor_id
            WHERE rr.patient_id = ?
            ORDER BY rr.result_date DESC
        `, [patientId]);

        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching radiological results' });
    }
};
