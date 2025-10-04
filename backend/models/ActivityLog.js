const { pool } = require('../config/database');

class ActivityLog {
  static async getRecent(limit = 10) {
    try {
      const [rows] = await pool.execute(
        `SELECT al.*, s.name as student_name, s.email as student_email
         FROM activity_log al
         JOIN students s ON al.student_id = s.id
         ORDER BY al.accessed_at DESC
         LIMIT ${parseInt(limit)}`
      );
      return rows;
    } catch (err) {
      console.error('Get recent activities error:', err);
      throw new Error('Failed to fetch recent activities');
    }
  }

  static async getByStudentId(studentId) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM activity_log WHERE student_id = ? ORDER BY accessed_at DESC',
        [studentId]
      );
      return rows;
    } catch (err) {
      console.error('Get activity by student id error:', err);
      throw new Error('Failed to fetch activity');
    }
  }

  static async create(studentId, sheet, slide, level) {
    try {
      await pool.execute(
        'INSERT INTO activity_log (student_id, sheet, slide, level) VALUES (?, ?, ?, ?)',
        [studentId, sheet, slide, level]
      );
      return true;
    } catch (err) {
      console.error('Create activity error:', err);
      throw new Error('Failed to create activity');
    }
  }

  static async logActivity(data) {
    try {
      const { student_id, action, details } = data;
      await pool.execute(
        'INSERT INTO activity_log (student_id, action, details) VALUES (?, ?, ?)',
        [student_id, action, details]
      );
      return true;
    } catch (err) {
      console.error('Log activity error:', err);
      throw new Error('Failed to log activity');
    }
  }
}

module.exports = ActivityLog;
