const Video = require('../models/Video');
const { uploadToS3, listS3Videos, deleteFromS3, parseVideoFilename } = require('../config/s3');
const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are allowed'));
    }
  }
});

exports.uploadMiddleware = upload.single('video');

exports.uploadVideo = async (req, res) => {
  try {
    const { level, sheetStart, sheetEnd } = req.body;

    if (!level || !sheetStart || !sheetEnd) {
      return res.status(400).json({ error: 'Level, sheetStart, and sheetEnd are required' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Video file is required' });
    }

    const filename = `L${level}_${sheetStart}_${sheetEnd}.mp4`;

    const { url, key } = await uploadToS3(req.file, filename);

    await Video.create(
      parseInt(level),
      parseInt(sheetStart),
      parseInt(sheetEnd),
      url,
      key,
      filename
    );

    res.status(201).json({
      message: 'Video uploaded successfully',
      video: { level, sheetStart, sheetEnd, url, filename }
    });
  } catch (error) {
    console.error('Upload video error:', error);
    res.status(500).json({ error: 'Failed to upload video: ' + error.message });
  }
};

exports.getAllVideos = async (req, res) => {
  try {
    const videos = await Video.getAll();
    res.json(videos);
  } catch (error) {
    console.error('Get videos error:', error);
    res.status(500).json({ error: 'Failed to fetch videos' });
  }
};

exports.getVideosByLevel = async (req, res) => {
  try {
    const { level } = req.params;
    const videos = await Video.getByLevel(parseInt(level));
    res.json(videos);
  } catch (error) {
    console.error('Get videos by level error:', error);
    res.status(500).json({ error: 'Failed to fetch videos' });
  }
};

exports.getVideoBySheet = async (req, res) => {
  try {
    const { level, sheet } = req.params;
    const video = await Video.getByLevelAndSheet(parseInt(level), parseInt(sheet));

    if (!video) {
      return res.status(404).json({ error: 'No video found for this sheet' });
    }

    const nextVideo = await Video.getNextVideo(parseInt(level), video.sheet_end);
    const prevVideo = await Video.getPreviousVideo(parseInt(level), video.sheet_start);

    res.json({
      current: video,
      next: nextVideo || null,
      previous: prevVideo || null
    });
  } catch (error) {
    console.error('Get video by sheet error:', error);
    res.status(500).json({ error: 'Failed to fetch video' });
  }
};

exports.deleteVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const video = await Video.getById(id);

    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    if (video.video_key) {
      await deleteFromS3(video.video_key);
    }

    await Video.delete(id);

    res.json({ message: 'Video deleted successfully' });
  } catch (error) {
    console.error('Delete video error:', error);
    res.status(500).json({ error: 'Failed to delete video' });
  }
};

exports.syncS3Videos = async (req, res) => {
  try {
    const s3Videos = await listS3Videos();
    const dbVideos = await Video.getAll();

    const dbVideoKeys = new Set(dbVideos.map(v => v.video_key));

    let added = 0;
    for (const s3Video of s3Videos) {
      if (!dbVideoKeys.has(s3Video.key)) {
        const parsed = parseVideoFilename(s3Video.filename);
        if (parsed) {
          await Video.create(
            parsed.level,
            parsed.sheetStart,
            parsed.sheetEnd,
            s3Video.url,
            s3Video.key,
            s3Video.filename
          );
          added++;
        }
      }
    }

    res.json({
      message: `Sync completed. Added ${added} new videos.`,
      added
    });
  } catch (error) {
    console.error('Sync S3 videos error:', error);
    res.status(500).json({ error: 'Failed to sync videos: ' + error.message });
  }
};

exports.addGoogleDriveVideo = async (req, res) => {
  try {
    const { level, sheetStart, sheetEnd, driveUrl } = req.body;

    if (!level || !sheetStart || !sheetEnd || !driveUrl) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const filename = `L${level}_${sheetStart}_${sheetEnd}_gdrive`;

    await Video.create(
      parseInt(level),
      parseInt(sheetStart),
      parseInt(sheetEnd),
      driveUrl,
      null,
      filename
    );

    res.status(201).json({
      message: 'Google Drive video added successfully',
      video: { level, sheetStart, sheetEnd, url: driveUrl }
    });
  } catch (error) {
    console.error('Add Google Drive video error:', error);
    res.status(500).json({ error: 'Failed to add video' });
  }
};
