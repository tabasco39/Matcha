import db from '../config/database.js';

class EmailTokenModel {
    static async create(data) {
        const [result] = await db.query('INSERT INTO email_tokens SET ?', [data]);
        return result.insertId;
    }

    static async findByToken(token) {
        const [rows] = await db.query('SELECT * FROM email_tokens WHERE token = ?', [token]);
        return rows[0];
    }

    static async delete(id) {
        const [result] = await db.query('DELETE FROM email_tokens WHERE id = ?', [id]);
        return result.affectedRows;
    }

}

export default EmailTokenModel;