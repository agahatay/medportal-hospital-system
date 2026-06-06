const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/departmentController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

router.get('/', verifyToken, departmentController.getAllDepartments);
router.post('/', verifyToken, checkRole(['ADMIN']), departmentController.createDepartment);
router.delete('/:id', verifyToken, checkRole(['ADMIN']), departmentController.deleteDepartment);

module.exports = router;
