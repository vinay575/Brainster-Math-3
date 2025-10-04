const { pool } = require('../config/database');

class Student {
  static async getAll() {
    try {
      const [rows] = await pool.execute('SELECT * FROM students');
      return rows.map(row => ({
        ...row,
        accessible_levels: row.accessible_levels ? 
          (typeof row.accessible_levels === 'string' ? JSON.parse(row.accessible_levels) : row.accessible_levels) : 
          [],
      }));
    } catch (err) {
      console.error('Get students error:', err);
      throw new Error('Failed to fetch students');
    }
  }

  static async getById(id) {
    try {
      const [rows] = await pool.execute('SELECT * FROM students WHERE id = ?', [id]);
      if (rows.length === 0) return null;
      const student = rows[0];
      student.accessible_levels = student.accessible_levels ? 
        (typeof student.accessible_levels === 'string' ? JSON.parse(student.accessible_levels) : student.accessible_levels) : 
        [];
      return student;
    } catch (err) {
      console.error(`Get student by id error: ${id}`, err);
      throw new Error('Failed to fetch student');
    }
  }

  static async create(data) {
    try {
      const { name, email, password, phone, address, level = 1, accessible_levels = [], authProvider = 'email', firebaseUid } = data;
      
      // Hash password if provided
      let password_hash = null;
      if (password) {
        const bcrypt = require('bcrypt');
        password_hash = await bcrypt.hash(password, 10);
      }
      
      const [result] = await pool.execute(
        'INSERT INTO students (name, email, password_hash, phone, address, level, accessible_levels, auth_provider, firebase_uid) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [name, email, password_hash, phone || null, address || null, level, JSON.stringify(accessible_levels), authProvider, firebaseUid || null]
      );
      return result.insertId;
    } catch (err) {
      console.error('Create student error:', err);
      throw new Error('Failed to create student');
    }
  }

  static async update(id, data) {
    try {
      const { name, email, phone, address, level, accessible_levels } = data;
      await pool.execute(
        'UPDATE students SET name=?, email=?, phone=?, address=?, level=?, accessible_levels=? WHERE id=?',
        [name, email, phone, address, level, JSON.stringify(accessible_levels), id]
      );
      return true;
    } catch (err) {
      console.error('Update student error:', err);
      throw new Error('Failed to update student');
    }
  }

  static async delete(id) {
    try {
      await pool.execute('DELETE FROM students WHERE id=?', [id]);
      return true;
    } catch (err) {
      console.error('Delete student error:', err);
      throw new Error('Failed to delete student');
    }
  }

  // Additional methods needed by controllers
  static async findById(id) {
    return this.getById(id);
  }

  static async findByEmail(email) {
    try {
      const [rows] = await pool.execute('SELECT * FROM students WHERE email = ?', [email]);
      if (rows.length === 0) return null;
      const student = rows[0];
      student.accessible_levels = student.accessible_levels ? 
        (typeof student.accessible_levels === 'string' ? JSON.parse(student.accessible_levels) : student.accessible_levels) : 
        [];
      return student;
    } catch (err) {
      console.error(`Find student by email error: ${email}`, err);
      throw new Error('Failed to find student');
    }
  }

  static async findByFirebaseUid(uid) {
    try {
      const [rows] = await pool.execute('SELECT * FROM students WHERE firebase_uid = ?', [uid]);
      if (rows.length === 0) return null;
      const student = rows[0];
      student.accessible_levels = student.accessible_levels ? 
        (typeof student.accessible_levels === 'string' ? JSON.parse(student.accessible_levels) : student.accessible_levels) : 
        [];
      return student;
    } catch (err) {
      console.error(`Find student by firebase uid error: ${uid}`, err);
      throw new Error('Failed to find student');
    }
  }

  static async getTotalCount() {
    try {
      const [rows] = await pool.execute('SELECT COUNT(*) as count FROM students');
      return rows[0].count;
    } catch (err) {
      console.error('Get total count error:', err);
      throw new Error('Failed to get total count');
    }
  }

  static async getCountByLevel() {
    try {
      const [rows] = await pool.execute('SELECT level, COUNT(*) as count FROM students GROUP BY level ORDER BY level');
      return rows;
    } catch (err) {
      console.error('Get count by level error:', err);
      throw new Error('Failed to get count by level');
    }
  }

  static async verifyPassword(password, hash) {
    const bcrypt = require('bcrypt');
    return bcrypt.compare(password, hash);
  }

  static async updateLevel(studentId, newLevel) {
    try {
      await pool.execute(
        'UPDATE students SET level = ? WHERE id = ?',
        [newLevel, studentId]
      );
      return true;
    } catch (err) {
      console.error('Update level error:', err);
      throw new Error('Failed to update level');
    }
  }
}

module.exports = Student;
