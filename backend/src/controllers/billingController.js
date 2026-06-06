const db = require('../config/db');

// Helper: resolve the patient_id for the authenticated user
const resolvePatientId = async (userId) => {
    const [rows] = await db.execute(
        'SELECT patient_id FROM Patients WHERE user_id = ?',
        [userId]
    );
    return rows.length > 0 ? rows[0].patient_id : null;
};

// Shared SELECT for billing rows (patient view)
const BILL_SELECT_PATIENT = `
    SELECT b.bill_id,
           b.total_amount,
           b.payment_status,
           b.payment_method,
           b.billing_date,
           b.payment_date,
           a.appointment_id,
           a.appointment_date,
           CONCAT(d.first_name, ' ', d.last_name) AS doctor_name,
           d.specialization AS doctor_specialization
    FROM   Billing      b
    JOIN   Appointments a ON b.appointment_id = a.appointment_id
    JOIN   Doctors      d ON a.doctor_id      = d.doctor_id
`;

// GET /api/billing/my-bills
exports.getMyBills = async (req, res) => {
    try {
        const patientId = await resolvePatientId(req.user.id);
        if (!patientId) {
            return res.status(404).json({ message: 'Patient profile not found' });
        }

        const [rows] = await db.execute(
            BILL_SELECT_PATIENT +
            'WHERE a.patient_id = ? ORDER BY b.billing_date DESC, a.appointment_date DESC',
            [patientId]
        );

        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching bills' });
    }
};

// PATCH /api/billing/:billId/pay
// Card details are NEVER stored — only the intent to pay reaches here.
// Only Online bills may be paid through this endpoint; Cash bills are settled at the hospital.
exports.payBill = async (req, res) => {
    const { billId } = req.params;

    try {
        const patientId = await resolvePatientId(req.user.id);
        if (!patientId) {
            return res.status(404).json({ message: 'Patient profile not found' });
        }

        // Fetch the bill with its owning patient for security check
        const [billRows] = await db.execute(
            `SELECT b.bill_id, b.payment_status, b.payment_method, a.patient_id
             FROM   Billing b
             JOIN   Appointments a ON b.appointment_id = a.appointment_id
             WHERE  b.bill_id = ?`,
            [billId]
        );

        if (billRows.length === 0) {
            return res.status(404).json({ message: 'Bill not found' });
        }

        const bill = billRows[0];

        // Security: patient must own this bill
        if (bill.patient_id !== patientId) {
            return res.status(403).json({ message: 'Access denied' });
        }

        // Cash bills must be paid at the hospital — admin marks them Paid after collection
        if (bill.payment_method === 'Cash') {
            return res.status(400).json({ message: 'Cash bills must be paid at the hospital. Please visit reception.' });
        }

        // Only Pending or Failed bills may be paid
        if (bill.payment_status === 'Paid') {
            return res.status(400).json({ message: 'This bill has already been paid' });
        }

        const now = new Date();
        await db.execute(
            'UPDATE Billing SET payment_status = ?, payment_date = ? WHERE bill_id = ?',
            ['Paid', now, billId]
        );

        // Return the updated bill row
        const [updated] = await db.execute(
            BILL_SELECT_PATIENT + 'WHERE b.bill_id = ?',
            [billId]
        );

        res.json(updated[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error processing payment' });
    }
};
