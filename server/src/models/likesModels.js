import { db } from '../config/database.js';

class LikeModel {
    static async likeUser(userid, liked_userid) {
        const [res] = await db.query(
            'INSERT INTO likes (userid, liked_userid) VALUES (?, ?)',
            [userid, liked_userid]
        )
        return res.insertId;
    }
    static async unlikeUser(userid, liked_userid) {
        const [res] = await db.query(
            'DELETE FROM likes WHERE userid = ? AND liked_userid = ?',
            [userid, liked_userid]
        )
        return res.affectedRows;
    }
    static async isLiked(userid, liked_userid) {
        const [rows] = await db.query(
            'SELECT * FROM likes WHERE userid = ? AND liked_userid = ?',
            [userid, liked_userid]
        )
        return rows.length > 0;
    }
    static async isMatch(userid, liked_userid) {
        const [rows] = await db.query(
            'SELECT * FROM likes WHERE userid = ? AND liked_userid = ?',
            [liked_userid, userid]
        )
        return rows.length > 0;
    }

}

export default LikeModel;