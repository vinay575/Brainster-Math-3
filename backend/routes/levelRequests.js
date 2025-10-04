const express = require('express');
const router = express.Router();
const levelRequestController = require('../controllers/levelRequestController');
const { verifyToken, verifyAdmin, verifyStudent } = require('../middleware/auth');

router.post('/', verifyToken, verifyStudent, levelRequestController.createRequest);
router.get('/my-requests', verifyToken, verifyStudent, levelRequestController.getMyRequests);
router.get('/', verifyToken, verifyAdmin, levelRequestController.getAllRequests);
router.get('/pending', verifyToken, verifyAdmin, levelRequestController.getPendingRequests);
router.get('/pending/count', verifyToken, verifyAdmin, levelRequestController.getPendingCount);
router.post('/:id/approve', verifyToken, verifyAdmin, levelRequestController.approveRequest);
router.post('/:id/reject', verifyToken, verifyAdmin, levelRequestController.rejectRequest);

module.exports = router;
