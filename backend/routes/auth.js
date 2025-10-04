const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');

router.post('/admin/login', authController.adminLogin);
router.post('/student/login', authController.studentLogin);
router.post('/student/signup', authController.studentSignup);
router.post('/google', authController.googleLogin);
router.get('/verify', verifyToken, authController.verifyToken);

module.exports = router;
