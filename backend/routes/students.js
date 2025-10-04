const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { verifyToken, verifyAdmin, verifyStudent } = require('../middleware/auth');

router.get('/stats', verifyToken, verifyAdmin, studentController.getStats);
router.get('/profile', verifyToken, verifyStudent, studentController.getMyProfile);
router.get('/activity', verifyToken, verifyStudent, studentController.getMyActivity);
router.post('/activity', verifyToken, verifyStudent, studentController.logActivity);

router.get('/', verifyToken, verifyAdmin, studentController.getAllStudents);
router.get('/:id', verifyToken, verifyAdmin, studentController.getStudentById);
router.post('/', verifyToken, verifyAdmin, studentController.createStudent);
router.put('/:id', verifyToken, verifyAdmin, studentController.updateStudent);
router.delete('/:id', verifyToken, verifyAdmin, studentController.deleteStudent);

module.exports = router;
