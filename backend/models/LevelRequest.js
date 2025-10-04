const { pool } = require('../config/database');

class LevelRequest {
  static async create(studentId, currentLevel, requestedLevel, message) {
    const [result] = await pool.execute(
      'INSERT INTO level_requests (student_id, current_level, requested_level, message) VALUES (?, ?, ?, ?)',
      [studentId, currentLevel, requestedLevel, message]
    );
    return result.insertId;
  }

  static async getAll() {
    const [rows] = await pool.execute(
      `SELECT lr.*, s.name as student_name, s.email as student_email
       FROM level_requests lr
       JOIN students s ON lr.student_id = s.id
       ORDER BY lr.created_at DESC`
    );
    return rows;
  }

  static async getPending() {
    const [rows] = await pool.execute(
      `SELECT lr.*, s.name as student_name, s.email as student_email
       FROM level_requests lr
       JOIN students s ON lr.student_id = s.id
       WHERE lr.status = 'pending'
       ORDER BY lr.created_at DESC`
    );
    return rows;
  }

  static async getByStudentId(studentId) {
    const [rows] = await pool.execute(
      'SELECT * FROM level_requests WHERE student_id = ? ORDER BY created_at DESC',
      [studentId]
    );
    return rows;
  }

  static async getById(id) {
    const [rows] = await pool.execute(
      'SELECT * FROM level_requests WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  static async updateStatus(id, status, adminResponse = null) {
    await pool.execute(
      'UPDATE level_requests SET status = ?, admin_response = ? WHERE id = ?',
      [status, adminResponse, id]
    );
  }

  static async delete(id) {
    await pool.execute('DELETE FROM level_requests WHERE id = ?', [id]);
  }

  static async getPendingCount() {
    const [rows] = await pool.execute(
      'SELECT COUNT(*) as count FROM level_requests WHERE status = "pending"'
    );
    return rows[0].count;
  }
}

module.exports = LevelRequest;
