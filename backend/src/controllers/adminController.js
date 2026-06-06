const db = require('../config/db');

// Shared SELECT for admin billing rows
const BILL_SELECT_ADMIN = `
    SELECT b.bill_id,
           b.total_amount,
           b.payment_status,
           b.payment_method,
           b.billing_date,
           b.payment_date,
           a.appointment_id,
           a.appointment_date,
           CONCAT(p.first_name, ' ', p.last_name) AS patient_name,
           p.patient_id,
           CONCAT(d.first_name, ' ', d.last_name) AS doctor_name,
           d.specialization AS doctor_specialization
    FROM   Billing      b
    JOIN   Appointments a ON b.appointment_id = a.appointment_id
    JOIN   Patients     p ON a.patient_id     = p.patient_id
    JOIN   Doctors      d ON a.doctor_id      = d.doctor_id
`;

// GET /api/admin/billing
exports.getAllBills = async (req, res) => {
    const { status, patient_name, doctor_name, payment_method } = req.query;

    const conditions = [];
    const params     = [];

    if (status)         { conditions.push('b.payment_status = ?');                        params.push(status); }
    if (payment_method) { conditions.push('b.payment_method = ?');                        params.push(payment_method); }
    if (patient_name)   { conditions.push("CONCAT(p.first_name,' ',p.last_name) LIKE ?"); params.push(`%${patient_name}%`); }
    if (doctor_name)    { conditions.push("CONCAT(d.first_name,' ',d.last_name) LIKE ?"); params.push(`%${doctor_name}%`); }

    const where = conditions.length ? ' WHERE ' + conditions.join(' AND ') : '';

    try {
        const [rows] = await db.execute(
            BILL_SELECT_ADMIN + where + ' ORDER BY b.billing_date DESC, a.appointment_date DESC',
            params
        );
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching billing records' });
    }
};

// PATCH /api/admin/billing/:billId/status
exports.updateBillStatus = async (req, res) => {
    const { billId } = req.params;
    const { status } = req.body;

    const VALID = ['Paid', 'Pending', 'Failed'];
    if (!VALID.includes(status)) {
        return res.status(400).json({ message: 'Invalid status. Must be Paid, Pending, or Failed' });
    }

    try {
        const paymentDate = status === 'Paid' ? new Date() : null;

        const [result] = await db.execute(
            'UPDATE Billing SET payment_status = ?, payment_date = ? WHERE bill_id = ?',
            [status, paymentDate, billId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Bill not found' });
        }

        const [rows] = await db.execute(BILL_SELECT_ADMIN + 'WHERE b.bill_id = ?', [billId]);
        res.json(rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating bill status' });
    }
};

exports.getStats = async (req, res) => {
    try {
        const [docs]  = await db.execute('SELECT COUNT(*) as count FROM Doctors');
        const [pats]  = await db.execute('SELECT COUNT(*) as count FROM Patients');
        const [depts] = await db.execute('SELECT COUNT(*) as count FROM Departments');
        const [apps]  = await db.execute('SELECT COUNT(*) as count FROM Appointments');

        const [statusCounts] = await db.execute(
            'SELECT status, COUNT(*) as count FROM Appointments GROUP BY status'
        );

        const [todayRows] = await db.execute(
            "SELECT COUNT(*) as count FROM Appointments WHERE DATE(appointment_date) = CURDATE()"
        );

        // Most booked department via Doctor_Departments junction
        const [deptRows] = await db.execute(`
            SELECT dept.name, COUNT(a.appointment_id) AS count
            FROM Appointments a
            JOIN Doctors d          ON a.doctor_id      = d.doctor_id
            JOIN Doctor_Departments dd  ON d.doctor_id  = dd.doctor_id
            JOIN Departments dept   ON dd.department_id = dept.department_id
            GROUP BY dept.department_id, dept.name
            ORDER BY count DESC
            LIMIT 1
        `);

        const stats = {
            totalDoctors:         docs[0].count,
            totalPatients:        pats[0].count,
            totalDepartments:     depts[0].count,
            totalAppointments:    apps[0].count,
            appointmentsToday:    todayRows[0].count,
            mostBookedDepartment: deptRows.length > 0 ? deptRows[0].name : 'N/A',
            statusBreakdown:      statusCounts.reduce((acc, row) => {
                acc[row.status] = row.count;
                return acc;
            }, {})
        };

        res.json(stats);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching admin stats' });
    }
};
