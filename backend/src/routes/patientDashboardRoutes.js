const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/patientDashboardController');
const { optionalAuth, verifyToken, checkRole } = require('../middleware/authMiddleware');

// Profile — authenticated PATIENT only
router.get('/profile', verifyToken, checkRole(['PATIENT']), ctrl.getProfile);
router.put('/profile', verifyToken, checkRole(['PATIENT']), ctrl.updateProfile);

// Doctor listing — public (no medical data, just names/specializations for browsing)
router.get('/doctors',            optionalAuth, ctrl.getDoctors);
router.get('/doctors/:doctor_id', optionalAuth, ctrl.getDoctorById);

// All medical data routes — authenticated PATIENT only (IDOR fix: removed optionalAuth)
router.get('/medical-records',       verifyToken, checkRole(['PATIENT']), ctrl.getMedicalRecords);
router.get('/prescriptions',         verifyToken, checkRole(['PATIENT']), ctrl.getPrescriptions);
router.get('/medications',           verifyToken, checkRole(['PATIENT']), ctrl.getMedications);
router.get('/radiological-results',  verifyToken, checkRole(['PATIENT']), ctrl.getRadiologicalResults);

module.exports = router;
