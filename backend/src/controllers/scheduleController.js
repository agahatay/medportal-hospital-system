const db = require('../config/db');

// Helper: resolve Doctors.doctor_id from a user_id (JWT)
const getDoctorIdByUserId = async (userId) => {
    const [rows] = await db.execute('SELECT doctor_id FROM Doctors WHERE user_id = ?', [userId]);
    return rows.length > 0 ? rows[0].doctor_id : null;
};

// Helper: verify a doctor has access to the target doctor ID
// ADMIN can manage any; DOCTOR can only manage their own
const assertScheduleAccess = async (req, targetDoctorId) => {
    if (req.user.role === 'ADMIN') return true;
    const ownDoctorId = await getDoctorIdByUserId(req.user.id);
    return ownDoctorId !== null && ownDoctorId === parseInt(targetDoctorId);
};

// GET /api/doctors/:id/schedules
exports.getSchedules = async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await db.execute(
            'SELECT * FROM doctor_schedules WHERE doctor_id = ? ORDER BY day_of_week',
            [id]
        );
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching schedules' });
    }
};

// POST /api/doctors/:id/schedules
exports.createSchedule = async (req, res) => {
    const { id } = req.params;
    const { day_of_week, start_time, end_time } = req.body;

    if (day_of_week === undefined || day_of_week === null || !start_time || !end_time) {
        return res.status(400).json({ message: 'day_of_week, start_time, and end_time are required' });
    }
    if (day_of_week < 0 || day_of_week > 6) {
        return res.status(400).json({ message: 'day_of_week must be 0 (Sun) through 6 (Sat)' });
    }

    const allowed = await assertScheduleAccess(req, id);
    if (!allowed) {
        return res.status(403).json({ message: 'You can only manage your own schedule' });
    }

    try {
        const [result] = await db.execute(
            'INSERT INTO doctor_schedules (doctor_id, day_of_week, start_time, end_time) VALUES (?, ?, ?, ?)',
            [id, day_of_week, start_time, end_time]
        );
        res.status(201).json({ message: 'Schedule entry created', id: result.insertId });
    } catch (error) {
        console.error(error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'A schedule already exists for this day. Delete it first.' });
        }
        res.status(500).json({ message: 'Error creating schedule' });
    }
};

// DELETE /api/doctors/:id/schedules/:scheduleId
exports.deleteSchedule = async (req, res) => {
    const { id, scheduleId } = req.params;

    const allowed = await assertScheduleAccess(req, id);
    if (!allowed) {
        return res.status(403).json({ message: 'You can only manage your own schedule' });
    }

    try {
        const [result] = await db.execute(
            'DELETE FROM doctor_schedules WHERE id = ? AND doctor_id = ?',
            [scheduleId, id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Schedule entry not found' });
        }
        res.json({ message: 'Schedule entry deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error deleting schedule' });
    }
};

// GET /api/doctors/:id/available-slots?date=YYYY-MM-DD
exports.getAvailableSlots = async (req, res) => {
    const { id }   = req.params;
    const { date } = req.query;

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return res.status(400).json({ message: 'date query parameter is required (YYYY-MM-DD)' });
    }

    try {
        // day_of_week matches JS Date.getDay() convention (0=Sun … 6=Sat)
        const dateObj   = new Date(`${date}T00:00:00`);
        const dayOfWeek = dateObj.getDay();

        const [schedules] = await db.execute(
            'SELECT start_time, end_time FROM doctor_schedules WHERE doctor_id = ? AND day_of_week = ?',
            [id, dayOfWeek]
        );

        let startH, startM, endH, endM;
        if (schedules.length === 0) {
            startH = 9;  startM = 0;
            endH   = 17; endM   = 0;
        } else {
            [startH, startM] = schedules[0].start_time.split(':').map(Number);
            [endH,   endM]   = schedules[0].end_time.split(':').map(Number);
        }

        // Generate 20-minute slots: start ≤ slot < end
        const allSlots = [];
        let h = startH, m = startM;
        while (h * 60 + m < endH * 60 + endM) {
            allSlots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
            m += 20;
            if (m >= 60) { h += 1; m -= 60; }
        }

        // Get already-booked slots for this doctor on this date
        const [booked] = await db.execute(
            `SELECT TIME_FORMAT(appointment_date, '%H:%i') AS appt_time
             FROM Appointments
             WHERE doctor_id = ?
               AND DATE(appointment_date) = ?
               AND status != 'Cancelled'`,
            [id, date]
        );

        const bookedTimes = new Set(booked.map(r => r.appt_time));
        const available   = allSlots.filter(slot => !bookedTimes.has(slot));

        res.json(available);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching available slots' });
    }
};
