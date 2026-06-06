const express = require('express');
const router  = express.Router();
const billing = require('../controllers/billingController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

// All billing routes require an authenticated PATIENT
router.use(verifyToken, checkRole(['PATIENT']));

// GET  /api/billing/my-bills      — patient views own bills
// PATCH /api/billing/:billId/pay  — patient pays a specific bill (must own it)
router.get('/my-bills',        billing.getMyBills);
router.patch('/:billId/pay',   billing.payBill);

module.exports = router;
