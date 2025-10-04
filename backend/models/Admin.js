const { pool } = require('../config/database');
const bcrypt = require('bcrypt');

class Admin {
  static async create(email, password, name) {
    const passwordHash = await bcrypt.hash(password, 10);
    const [result] = await pool.execute(
      'INSERT INTO admins (email, password_hash, name) VALUES (?, ?, ?)',
      [email, passwordHash, name]
    );
    return result.insertId;
  }

  static async findByEmail(email) {
    const [rows] = await pool.execute(
      'SELECT * FROM admins WHERE email = ?',
      [email]
    );
    return rows[0];
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      'SELECT * FROM admins WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  static async verifyPassword(password, hash) {
    return bcrypt.compare(password, hash);
  }

  static async getAll() {
    const [rows] = await pool.execute('SELECT id, email, name, created_at FROM admins');
    return rows;
  }
}

module.exports = Admin;
