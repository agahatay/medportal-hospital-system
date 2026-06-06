const db = require('../config/db');

exports.getAllDepartments = async (_req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM Departments');
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching departments' });
    }
};

exports.createDepartment = async (req, res) => {
    const { name, location } = req.body;
    if (!name) {
        return res.status(400).json({ message: 'Department name is required' });
    }

    try {
        const [result] = await db.execute(
            'INSERT INTO Departments (name, location) VALUES (?, ?)',
            [name, location || null]
        );
        res.status(201).json({ message: 'Department created', id: result.insertId });
    } catch (error) {
        console.error(error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Department already exists' });
        }
        res.status(500).json({ message: 'Error creating department' });
    }
};

exports.deleteDepartment = async (req, res) => {
    const { id } = req.params;

    try {
        const [rows] = await db.execute(
            'SELECT department_id FROM Departments WHERE department_id = ?', [id]
        );
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Department not found' });
        }

        await db.execute('DELETE FROM Departments WHERE department_id = ?', [id]);
        res.json({ message: 'Department deleted successfully' });
    } catch (error) {
        console.error(error);
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(409).json({ message: 'Cannot delete department: doctors are assigned to it' });
        }
        res.status(500).json({ message: 'Error deleting department' });
    }
};
