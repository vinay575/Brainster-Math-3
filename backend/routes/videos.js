const express = require('express');
const router = express.Router();
const videoController = require('../controllers/videoController');
const { verifyToken, verifyAdmin, verifyStudent, verifyStudentLevel } = require('../middleware/auth');

router.post('/upload', verifyToken, verifyAdmin, videoController.uploadMiddleware, videoController.uploadVideo);
router.post('/google-drive', verifyToken, verifyAdmin, videoController.addGoogleDriveVideo);
router.post('/sync', verifyToken, verifyAdmin, videoController.syncS3Videos);
router.get('/all', verifyToken, verifyAdmin, videoController.getAllVideos);
router.get('/level/:level', verifyToken, verifyStudent, verifyStudentLevel, videoController.getVideosByLevel);
router.get('/level/:level/sheet/:sheet', verifyToken, verifyStudent, verifyStudentLevel, videoController.getVideoBySheet);
router.delete('/:id', verifyToken, verifyAdmin, videoController.deleteVideo);

module.exports = router;
