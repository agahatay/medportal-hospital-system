const db = require('../config/db');

// Consultation fee by department name (matches seed.sql department names exactly)
const DEPT_FEES = {
    'Cardiology':                350,
    'Neurology':                 400,
    'Orthopedics':               300,
    'Pediatrics':                250,
    'Dermatology':               250,
    'Ophthalmology':             300,
    'ENT':                       250,
    'Gastroenterology':          350,
    'Pulmonology':               300,
    'Urology':                   300,
    'Psychiatry':                350,
    'Oncology':                  500,
    'Endocrinology':             300,
    'Rheumatology':              350,
    'Nephrology':                350,
    'Hematology':                400,
    'Infectious Diseases':       300,
    'General Surgery':           500,
    'Obstetrics and Gynecology': 350,
    'Physical Therapy':          200,
};
const DEFAULT_FEE = 300;

exports.bookAppointment = async (req, res) => {
    const { doctor_id, appointment_date, reason, payment_method } = req.body;

    if (!doctor_id || !appointment_date) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    // Normalise payment_method — unknown value falls back to 'Online'
    const method = payment_method === 'Cash' ? 'Cash' : 'Online';

    try {
        // 1. Resolve patient record from JWT user id
        const [patientRows] = await db.execute(
            'SELECT patient_id FROM Patients WHERE user_id = ?', [req.user.id]
        );
        if (patientRows.length === 0) {
            const err = new Error('Patient profile not found for this user');
            err.statusCode = 404;
            throw err;
        }
        const real_patient_id = patientRows[0].patient_id;

        // 2. Check for double booking (same doctor, same datetime, not cancelled)
        const [existing] = await db.execute(
            "SELECT appointment_id FROM Appointments WHERE doctor_id = ? AND appointment_date = ? AND status != 'Cancelled'",
            [doctor_id, appointment_date]
        );
        if (existing.length > 0) {
            return res.status(409).json({ message: 'This time slot is already booked' });
        }

        // 3. Validate appointment_date format — require exactly "YYYY-MM-DD HH:MM:SS"
        const dateTimeRegex = /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/;
        const match = String(appointment_date).match(dateTimeRegex);

        console.log('[bookAppointment] raw appointment_date:', appointment_date);
        console.log('[bookAppointment] typeof:', typeof appointment_date);
        console.log('[bookAppointment] regex match:', match ? 'YES' : 'NO');

        if (!match) {
            return res.status(400).json({
                message: 'Invalid datetime format. Expected: YYYY-MM-DD HH:MM:SS (e.g. 2026-03-17 11:20:00)'
            });
        }

        const year   = Number(match[1]);
        const month  = Number(match[2]);
        const day    = Number(match[3]);
        const hour   = Number(match[4]);
        const minute = Number(match[5]);

        console.log('[bookAppointment] parsed:', { year, month, day, hour, minute });

        // 3a. Enforce 20-minute slot grid
        if (![0, 20, 40].includes(minute)) {
            console.log('[bookAppointment] REJECTED — minute', minute, 'is not in [0, 20, 40]');
            return res.status(400).json({
                message: 'Invalid time slot. Appointments must start at :00, :20, or :40.'
            });
        }

        // 3b. Check working hours using doctor_schedules
        const dateObj   = new Date(year, month - 1, day);
        const dayOfWeek = dateObj.getDay();

        const [schedules] = await db.execute(
            'SELECT start_time, end_time FROM doctor_schedules WHERE doctor_id = ? AND day_of_week = ?',
            [doctor_id, dayOfWeek]
        );

        const startH = schedules.length > 0 ? parseInt(schedules[0].start_time.split(':')[0]) : 9;
        const startM = schedules.length > 0 ? parseInt(schedules[0].start_time.split(':')[1]) : 0;
        const endH   = schedules.length > 0 ? parseInt(schedules[0].end_time.split(':')[0])   : 17;
        const endM   = schedules.length > 0 ? parseInt(schedules[0].end_time.split(':')[1])   : 0;

        const apptMinutes  = hour   * 60 + minute;
        const startMinutes = startH * 60 + startM;
        const endMinutes   = endH   * 60 + endM;

        if (apptMinutes < startMinutes || apptMinutes >= endMinutes) {
            return res.status(400).json({
                message: 'Appointment time is outside the doctor\'s working hours'
            });
        }

        // 4. Determine consultation fee from doctor's department
        const [deptRows] = await db.execute(
            `SELECT dept.name
             FROM   Doctor_Departments dd
             JOIN   Departments dept ON dd.department_id = dept.department_id
             WHERE  dd.doctor_id = ?
             LIMIT  1`,
            [doctor_id]
        );
        const deptName = deptRows.length > 0 ? deptRows[0].name : null;
        const fee      = DEPT_FEES[deptName] ?? DEFAULT_FEE;
        const billDate = appointment_date.substring(0, 10); // YYYY-MM-DD

        // 5. Atomic: create appointment + billing in one transaction
        const conn = await db.getConnection();
        let appointmentId, billId;
        try {
            await conn.beginTransaction();

            const [apptResult] = await conn.execute(
                'INSERT INTO Appointments (patient_id, doctor_id, appointment_date, duration, reason) VALUES (?, ?, ?, ?, ?)',
                [real_patient_id, doctor_id, appointment_date, 20, reason]
            );
            appointmentId = apptResult.insertId;

            const [billResult] = await conn.execute(
                'INSERT INTO Billing (appointment_id, total_amount, payment_status, billing_date, payment_method) VALUES (?, ?, ?, ?, ?)',
                [appointmentId, fee, 'Pending', billDate, method]
            );
            billId = billResult.insertId;

            await conn.commit();
        } catch (txErr) {
            await conn.rollback();
            throw txErr;
        } finally {
            conn.release();
        }

        res.status(201).json({
            message:        'Appointment booked successfully',
            appointment_id: appointmentId,
            bill_id:        billId,
            total_amount:   fee,
            payment_status: 'Pending',
            payment_method: method,
        });

    } catch (error) {
        console.error(error);

        const isDev = process.env.NODE_ENV === 'development';
        const detail = isDev ? { detail: error.message } : {};

        if (error.statusCode) {
            return res.status(error.statusCode).json({ message: error.message, ...detail });
        }
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'This appointment slot is already booked.', ...detail });
        }
        if (error.code === 'ER_CHECK_CONSTRAINT_VIOLATED') {
            return res.status(400).json({ message: 'Invalid time slot. Appointments must start at :00, :20, or :40.', ...detail });
        }
        if (error.code === 'ER_TRUNCATED_WRONG_VALUE' || error.code === 'ER_WRONG_VALUE') {
            return res.status(400).json({ message: 'Invalid appointment date or time format.', ...detail });
        }

        res.status(500).json({ message: 'Error booking appointment', ...detail });
    }
};

exports.getAppointments = async (req, res) => {
    try {
        let query = `
            SELECT a.*,
                   CONCAT(p.first_name, ' ', p.last_name) AS patient_name,
                   CONCAT(d.first_name, ' ', d.last_name) AS doctor_name,
                   dept.name AS department_name
            FROM Appointments a
            JOIN Patients    p    ON a.patient_id = p.patient_id
            JOIN Doctors     d    ON a.doctor_id  = d.doctor_id
            LEFT JOIN Doctor_Departments dd   ON d.doctor_id = dd.doctor_id
            LEFT JOIN Departments        dept ON dd.department_id = dept.department_id
        `;
        const params = [];

        if (req.user.role === 'PATIENT') {
            const [pRows] = await db.execute(
                'SELECT patient_id FROM Patients WHERE user_id = ?', [req.user.id]
            );
            if (pRows.length === 0) return res.json([]);
            query += ' WHERE a.patient_id = ?';
            params.push(pRows[0].patient_id);
        } else if (req.user.role === 'DOCTOR') {
            const [dRows] = await db.execute(
                'SELECT doctor_id FROM Doctors WHERE user_id = ?', [req.user.id]
            );
            if (dRows.length === 0) return res.json([]);
            query += ' WHERE a.doctor_id = ?';
            params.push(dRows[0].doctor_id);
        }

        query += ' ORDER BY a.appointment_date DESC';

        const [rows] = await db.execute(query, params);
        res.json(rows);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching appointments' });
    }
};

// ADMIN / DOCTOR: general status update
exports.updateStatus = async (req, res) => {
    const { id }     = req.params;
    const { status } = req.body;
    const validStatuses = ['Scheduled', 'Completed', 'Cancelled', 'No_Show'];

    if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    try {
        const [result] = await db.execute(
            'UPDATE Appointments SET status = ? WHERE appointment_id = ?', [status, id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Appointment not found' });
        }
        res.json({ message: 'Appointment status updated' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating status' });
    }
};

// PATIENT: cancel their own appointment
exports.cancelAppointment = async (req, res) => {
    const { id } = req.params;

    try {
        const [pRows] = await db.execute(
            'SELECT patient_id FROM Patients WHERE user_id = ?', [req.user.id]
        );
        if (pRows.length === 0) {
            return res.status(404).json({ message: 'Patient profile not found' });
        }
        const patientId = pRows[0].patient_id;

        const [apptRows] = await db.execute(
            'SELECT appointment_id, status, patient_id FROM Appointments WHERE appointment_id = ?', [id]
        );
        if (apptRows.length === 0) {
            return res.status(404).json({ message: 'Appointment not found' });
        }
        if (apptRows[0].patient_id !== patientId) {
            return res.status(403).json({ message: 'You can only cancel your own appointments' });
        }
        if (apptRows[0].status !== 'Scheduled') {
            return res.status(409).json({ message: 'Only scheduled appointments can be cancelled' });
        }

        await db.execute(
            "UPDATE Appointments SET status = 'Cancelled' WHERE appointment_id = ?", [id]
        );
        res.json({ message: 'Appointment cancelled successfully' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error cancelling appointment' });
    }
};
