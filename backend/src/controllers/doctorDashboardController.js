const db = require('../config/db');

// Helper: resolve doctor_id from JWT user_id only — no query-param override
const resolveDoctorId = async (req) => {
    const [rows] = await db.execute('SELECT doctor_id FROM Doctors WHERE user_id = ?', [req.user.id]);
    return rows.length > 0 ? rows[0].doctor_id : null;
};

// GET /api/doctor/dashboard
exports.getDashboard = async (req, res) => {
    try {
        const doctorId = await resolveDoctorId(req);
        if (!doctorId) return res.status(404).json({ message: 'Doctor profile not found' });

        const [todayAppointments] = await db.execute(`
            SELECT a.appointment_id, a.appointment_date, a.duration, a.reason, a.status,
                   CONCAT(p.first_name, ' ', p.last_name) AS patient_name, p.patient_id
            FROM Appointments a
            JOIN Patients p ON a.patient_id = p.patient_id
            WHERE a.doctor_id = ? AND DATE(a.appointment_date) = CURDATE()
            ORDER BY a.appointment_date ASC
        `, [doctorId]);

        const [upcomingAppointments] = await db.execute(`
            SELECT a.appointment_id, a.appointment_date, a.duration, a.reason, a.status,
                   CONCAT(p.first_name, ' ', p.last_name) AS patient_name, p.patient_id
            FROM Appointments a
            JOIN Patients p ON a.patient_id = p.patient_id
            WHERE a.doctor_id = ?
              AND DATE(a.appointment_date) > CURDATE()
              AND a.status = 'Scheduled'
            ORDER BY a.appointment_date ASC
            LIMIT 20
        `, [doctorId]);

        const [workHours] = await db.execute(
            'SELECT * FROM doctor_schedules WHERE doctor_id = ? ORDER BY day_of_week', [doctorId]
        );

        const [completedRow] = await db.execute(
            "SELECT COUNT(*) AS count FROM Appointments WHERE doctor_id = ? AND status = 'Completed'", [doctorId]
        );

        const nextPatient = todayAppointments.find(a => a.status === 'Scheduled') || null;

        res.json({
            todayAppointments,
            upcomingAppointments,
            nextPatient,
            workHours,
            overview: {
                todayCount:     todayAppointments.filter(a => a.status === 'Scheduled').length,
                upcomingCount:  upcomingAppointments.length,
                completedTotal: completedRow[0].count
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching doctor dashboard' });
    }
};

// GET /api/doctor/medical-records
exports.getMedicalRecords = async (req, res) => {
    try {
        const doctorId = await resolveDoctorId(req);
        if (!doctorId) return res.status(404).json({ message: 'Doctor profile not found' });

        const [rows] = await db.execute(`
            SELECT mr.record_id,
                   mr.diagnosis,
                   mr.treatment,
                   mr.record_date,
                   mr.created_at,
                   a.appointment_id,
                   a.appointment_date,
                   CONCAT(p.first_name, ' ', p.last_name) AS patient_name,
                   p.patient_id,
                   CONCAT(d.first_name, ' ', d.last_name) AS doctor_name
            FROM MedicalRecords mr
            JOIN Appointments a ON mr.appointment_id = a.appointment_id
            JOIN Patients p     ON a.patient_id       = p.patient_id
            JOIN Doctors  d     ON mr.doctor_id        = d.doctor_id
            WHERE mr.doctor_id = ?
            ORDER BY mr.record_date DESC, mr.created_at DESC
        `, [doctorId]);

        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching medical records' });
    }
};

// GET /api/doctor/prescriptions
exports.getPrescriptions = async (req, res) => {
    try {
        const doctorId = await resolveDoctorId(req);
        if (!doctorId) return res.status(404).json({ message: 'Doctor profile not found' });

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
                   CONCAT(p.first_name, ' ', p.last_name) AS patient_name,
                   p.patient_id
            FROM Prescriptions pr
            JOIN MedicalRecords mr ON pr.record_id     = mr.record_id
            JOIN Medications    med ON pr.medication_id = med.medication_id
            JOIN Appointments   a   ON mr.appointment_id = a.appointment_id
            JOIN Patients       p   ON a.patient_id      = p.patient_id
            WHERE mr.doctor_id = ?
            ORDER BY a.appointment_date DESC, pr.prescription_id ASC
        `, [doctorId]);

        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching prescriptions' });
    }
};

// GET /api/doctor/medications
exports.getMedications = async (req, res) => {
    try {
        const doctorId = await resolveDoctorId(req);
        if (!doctorId) return res.status(404).json({ message: 'Doctor profile not found' });

        const [rows] = await db.execute(`
            SELECT med.medication_id,
                   med.name,
                   COUNT(sub.prescription_id) AS prescription_count
            FROM Medications med
            LEFT JOIN (
                SELECT pr.prescription_id, pr.medication_id
                FROM Prescriptions pr
                INNER JOIN MedicalRecords mr ON pr.record_id = mr.record_id
                WHERE mr.doctor_id = ?
            ) sub ON med.medication_id = sub.medication_id
            GROUP BY med.medication_id, med.name
            ORDER BY prescription_count DESC, med.name ASC
        `, [doctorId]);

        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching medications' });
    }
};

// GET /api/doctor/billing
exports.getBilling = async (req, res) => {
    try {
        const doctorId = await resolveDoctorId(req);
        if (!doctorId) return res.status(404).json({ message: 'Doctor profile not found' });

        const [rows] = await db.execute(`
            SELECT b.bill_id,
                   b.total_amount,
                   b.payment_status,
                   b.payment_method,
                   b.billing_date,
                   b.payment_date,
                   a.appointment_id,
                   a.appointment_date,
                   CONCAT(p.first_name, ' ', p.last_name) AS patient_name,
                   p.patient_id
            FROM Billing b
            JOIN Appointments a ON b.appointment_id = a.appointment_id
            JOIN Patients     p ON a.patient_id     = p.patient_id
            WHERE a.doctor_id = ?
            ORDER BY b.billing_date DESC, a.appointment_date DESC
        `, [doctorId]);

        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching billing' });
    }
};

// GET /api/doctor/radiological-results
exports.getRadiologicalResults = async (req, res) => {
    try {
        const doctorId = await resolveDoctorId(req);
        if (!doctorId) return res.status(404).json({ message: 'Doctor profile not found' });

        const [rows] = await db.execute(`
            SELECT rr.result_id,
                   rr.image_type,
                   rr.body_part,
                   rr.image_url,
                   rr.findings,
                   rr.result_date,
                   rr.created_at,
                   a.appointment_id,
                   a.appointment_date,
                   CONCAT(p.first_name, ' ', p.last_name) AS patient_name,
                   p.patient_id
            FROM RadiologicalResults rr
            JOIN Appointments a ON rr.appointment_id = a.appointment_id
            JOIN Patients     p ON rr.patient_id     = p.patient_id
            WHERE rr.doctor_id = ?
            ORDER BY rr.result_date DESC
        `, [doctorId]);

        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching radiological results' });
    }
};
