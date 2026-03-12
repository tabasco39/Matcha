const db = require('../config/database');

class UserModel {
  static async findAll() {
    const [rows] = await db.query('SELECT * FROM users');
    return rows;
  }

  static async findById(id) {
    const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
    return rows[0] || null;
  }

  static async create(data) {
    const [result] = await db.query('INSERT INTO users SET ?', [data]);
    return result.insertId;
  }

  static async update(id, data) {
    const [result] = await db.query('UPDATE users SET ? WHERE id = ?', [data, id]);
    return result.affectedRows;
  }

  static async delete(id) {
    const [result] = await db.query('DELETE FROM users WHERE id = ?', [id]);
    return result.affectedRows;
  }
}

module.exports = UserModel;
