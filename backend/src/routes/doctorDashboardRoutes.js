const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/doctorDashboardController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

// All doctor dashboard routes — authenticated DOCTOR only (IDOR fix: replaced optionalAuth)
router.get('/dashboard',            verifyToken, checkRole(['DOCTOR']), ctrl.getDashboard);
router.get('/medical-records',      verifyToken, checkRole(['DOCTOR']), ctrl.getMedicalRecords);
router.get('/prescriptions',        verifyToken, checkRole(['DOCTOR']), ctrl.getPrescriptions);
router.get('/medications',          verifyToken, checkRole(['DOCTOR']), ctrl.getMedications);
router.get('/billing',              verifyToken, checkRole(['DOCTOR']), ctrl.getBilling);
router.get('/radiological-results', verifyToken, checkRole(['DOCTOR']), ctrl.getRadiologicalResults);

module.exports = router;
