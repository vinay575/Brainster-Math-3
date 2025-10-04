const { pool } = require('../config/database');

class Video {
  static async create(level, sheetStart, sheetEnd, videoUrl, videoKey, filename) {
    const [result] = await pool.execute(
      'INSERT INTO videos (level, sheet_start, sheet_end, video_url, video_key, filename) VALUES (?, ?, ?, ?, ?, ?)',
      [level, sheetStart, sheetEnd, videoUrl, videoKey, filename]
    );
    return result.insertId;
  }

  static async getAll() {
    const [rows] = await pool.execute(
      'SELECT * FROM videos ORDER BY level, sheet_start'
    );
    return rows;
  }

  static async getByLevel(level) {
    const [rows] = await pool.execute(
      'SELECT * FROM videos WHERE level = ? ORDER BY sheet_start',
      [level]
    );
    return rows;
  }

  static async getByLevelAndSheet(level, sheet) {
    const [rows] = await pool.execute(
      'SELECT * FROM videos WHERE level = ? AND sheet_start <= ? AND sheet_end >= ? ORDER BY sheet_start LIMIT 1',
      [level, sheet, sheet]
    );
    return rows[0];
  }

  static async getById(id) {
    const [rows] = await pool.execute(
      'SELECT * FROM videos WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  static async delete(id) {
    await pool.execute('DELETE FROM videos WHERE id = ?', [id]);
  }

  static async deleteByKey(videoKey) {
    await pool.execute('DELETE FROM videos WHERE video_key = ?', [videoKey]);
  }

  static async getNextVideo(level, currentSheetEnd) {
    const [rows] = await pool.execute(
      'SELECT * FROM videos WHERE level = ? AND sheet_start > ? ORDER BY sheet_start LIMIT 1',
      [level, currentSheetEnd]
    );
    return rows[0];
  }

  static async getPreviousVideo(level, currentSheetStart) {
    const [rows] = await pool.execute(
      'SELECT * FROM videos WHERE level = ? AND sheet_end < ? ORDER BY sheet_end DESC LIMIT 1',
      [level, currentSheetStart]
    );
    return rows[0];
  }
}

module.exports = Video;
