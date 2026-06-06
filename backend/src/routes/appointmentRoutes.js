const express = require('express');
const router  = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

// Patient: book a new appointment
router.post('/',
    verifyToken, checkRole(['PATIENT']),
    appointmentController.bookAppointment
);

// All roles: fetch own appointments (controller filters by role)
router.get('/',
    verifyToken,
    appointmentController.getAppointments
);

// Admin / Doctor: update status to any valid value
router.patch('/:id/status',
    verifyToken, checkRole(['ADMIN', 'DOCTOR']),
    appointmentController.updateStatus
);

// Patient: cancel their own appointment
router.patch('/:id/cancel',
    verifyToken, checkRole(['PATIENT']),
    appointmentController.cancelAppointment
);

module.exports = router;
