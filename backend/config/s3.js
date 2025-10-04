const AWS = require('aws-sdk');
require('dotenv').config();

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const BUCKET_NAME = process.env.AWS_BUCKET_NAME;
const BUCKET_PREFIX = process.env.AWS_BUCKET_PREFIX || 'brainstermath-videos/';

async function uploadToS3(file, filename) {
  const params = {
    Bucket: BUCKET_NAME,
    Key: `${BUCKET_PREFIX}${filename}`,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  try {
    const result = await s3.upload(params).promise();
    return {
      url: result.Location,
      key: result.Key,
    };
  } catch (error) {
    throw new Error('S3 upload failed: ' + error.message);
  }
}

async function listS3Videos() {
  const params = {
    Bucket: BUCKET_NAME,
    Prefix: BUCKET_PREFIX,
  };

  try {
    const data = await s3.listObjectsV2(params).promise();
    return data.Contents.map((item) => ({
      key: item.Key,
      url: `https://solutions.brainstermath.com/${item.Key}`,
     

      filename: item.Key.replace(BUCKET_PREFIX, ''), 
    }));
  } catch (error) {
    throw new Error('S3 list failed: ' + error.message);
  }
}

async function deleteFromS3(key) {
  const params = {
    Bucket: BUCKET_NAME,
    Key: key,
  };

  try {
    await s3.deleteObject(params).promise();
    return true;
  } catch (error) {
    throw new Error('S3 delete failed: ' + error.message);
  }
}

function parseVideoFilename(filename) {
  const regex = /^L(\d+)_(\d+)_(\d+)\.mp4$/;
  const match = filename.match(regex);

  if (match) {
    return {
      level: parseInt(match[1]),
      sheetStart: parseInt(match[2]),
      sheetEnd: parseInt(match[3]),
    };
  }
  return null;
}

module.exports = {
  uploadToS3,
  listS3Videos,
  deleteFromS3,
  parseVideoFilename,
  s3,
  BUCKET_NAME,
  BUCKET_PREFIX,
};
