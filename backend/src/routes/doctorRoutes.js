const express    = require('express');
const router     = express.Router();
const doctorController   = require('../controllers/doctorController');
const scheduleController = require('../controllers/scheduleController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

// ── Doctor CRUD ────────────────────────────────────────────────────────────────
// NOTE: /me must come before /:id so Express doesn't treat "me" as an id
router.get('/me',
    verifyToken, checkRole(['DOCTOR']),
    async (req, res) => {
        const db = require('../config/db');
        try {
            const [rows] = await db.execute(
                `SELECT d.doctor_id, d.user_id, d.first_name, d.last_name,
                        CONCAT(d.first_name, ' ', d.last_name) AS name,
                        d.specialization, d.phone, d.email, d.bio,
                        u.email AS user_email,
                        dept.name AS department_name, dd.department_id
                 FROM Doctors d
                 JOIN users u ON d.user_id = u.id
                 LEFT JOIN Doctor_Departments dd ON d.doctor_id = dd.doctor_id
                 LEFT JOIN Departments dept ON dd.department_id = dept.department_id
                 WHERE d.user_id = ?`,
                [req.user.id]
            );
            if (rows.length === 0) return res.status(404).json({ message: 'Doctor profile not found' });
            res.json(rows[0]);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Error fetching doctor profile' });
        }
    }
);

// PUT /api/doctors/me — doctor updates their own profile
router.put('/me',
    verifyToken, checkRole(['DOCTOR']),
    async (req, res) => {
        const db = require('../config/db');
        const { first_name, last_name, name, specialization, phone, bio } = req.body;

        let fName = (first_name || '').trim();
        let lName = (last_name  || '').trim();
        if (!fName && !lName && name) {
            const parts = name.trim().split(/\s+/);
            fName = parts[0];
            lName = parts.slice(1).join(' ') || parts[0];
        }
        if (!fName || !lName) {
            return res.status(400).json({ message: 'First name and last name are required' });
        }

        try {
            const [rows] = await db.execute(
                'SELECT doctor_id FROM Doctors WHERE user_id = ?', [req.user.id]
            );
            if (rows.length === 0) return res.status(404).json({ message: 'Doctor profile not found' });
            const doctorId = rows[0].doctor_id;

            await db.execute(
                `UPDATE Doctors SET first_name = ?, last_name = ?, specialization = ?, phone = ?, bio = ?
                 WHERE doctor_id = ?`,
                [fName, lName, specialization || null, phone || null, bio || null, doctorId]
            );

            const [updated] = await db.execute(
                `SELECT d.doctor_id, d.user_id, d.first_name, d.last_name,
                        CONCAT(d.first_name, ' ', d.last_name) AS name,
                        d.specialization, d.phone, d.email, d.bio,
                        u.email AS user_email,
                        dept.name AS department_name, dd.department_id
                 FROM Doctors d
                 JOIN users u ON d.user_id = u.id
                 LEFT JOIN Doctor_Departments dd ON d.doctor_id = dd.doctor_id
                 LEFT JOIN Departments dept ON dd.department_id = dept.department_id
                 WHERE d.user_id = ?`,
                [req.user.id]
            );
            res.json(updated[0]);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Error updating doctor profile' });
        }
    }
);

router.get('/',        verifyToken,                                doctorController.getAllDoctors);
router.post('/',       verifyToken, checkRole(['ADMIN']),          doctorController.createDoctor);
router.delete('/:id',  verifyToken, checkRole(['ADMIN']),          doctorController.deleteDoctor);

// ── Doctor Schedules (weekly working hours) ───────────────────────────────────
router.get('/:id/schedules',
    verifyToken,
    scheduleController.getSchedules
);

router.post('/:id/schedules',
    verifyToken, checkRole(['ADMIN', 'DOCTOR']),
    scheduleController.createSchedule
);

router.delete('/:id/schedules/:scheduleId',
    verifyToken, checkRole(['ADMIN', 'DOCTOR']),
    scheduleController.deleteSchedule
);

// ── Available Slots ────────────────────────────────────────────────────────────
router.get('/:id/available-slots',
    verifyToken,
    scheduleController.getAvailableSlots
);

module.exports = router;
