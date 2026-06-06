const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const doctorController = require('../controllers/doctorController');
const scheduleController = require('../controllers/scheduleController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

// All routes require ADMIN role
router.use(verifyToken, checkRole(['ADMIN']));

// Stats
router.get('/stats', adminController.getStats);

// Billing
router.get('/billing',                        adminController.getAllBills);
router.patch('/billing/:billId/status',       adminController.updateBillStatus);

// Doctor CRUD
router.get('/doctors',      doctorController.getAllDoctors);
router.post('/doctors',     doctorController.createDoctor);
router.put('/doctors/:id',  doctorController.updateDoctor);
router.delete('/doctors/:id', doctorController.deleteDoctor);

// Doctor Schedule Management
router.get('/doctors/:id/schedules',              scheduleController.getSchedules);
router.post('/doctors/:id/schedules',             scheduleController.createSchedule);
router.delete('/doctors/:id/schedules/:scheduleId', scheduleController.deleteSchedule);

module.exports = router;
