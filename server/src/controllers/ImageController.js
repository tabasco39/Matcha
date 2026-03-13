import { unlink } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import db from '../config/database.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const uploadsDir = join(__dirname, '../../uploads');

class ImageController {
  static async getMyImages(req, res, next) {
    try {
      const [rows] = await db.query(
        'SELECT id, path FROM images WHERE user_id = ? ORDER BY created_at ASC',
        [req.user.id]
      );
      res.json({ success: true, data: rows });
    } catch (err) {
      next(err);
    }
  }

  static async upload(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'Aucun fichier fourni' });
      }

      const [[{ count }]] = await db.query(
        'SELECT COUNT(*) as count FROM images WHERE user_id = ?',
        [req.user.id]
      );

      if (count >= 5) {
        await unlink(req.file.path).catch(() => {});
        return res.status(400).json({ success: false, message: 'Maximum 5 images autorisées' });
      }

      await db.query('INSERT INTO images (path, user_id) VALUES (?, ?)', [
        req.file.filename,
        req.user.id,
      ]);

      res.status(201).json({ success: true, data: { id: null, path: req.file.filename } });
    } catch (err) {
      next(err);
    }
  }

  static async remove(req, res, next) {
    try {
      const [rows] = await db.query(
        'SELECT path FROM images WHERE id = ? AND user_id = ?',
        [req.params.id, req.user.id]
      );

      if (!rows[0]) {
        return res.status(404).json({ success: false, message: 'Image introuvable' });
      }

      await db.query('DELETE FROM images WHERE id = ?', [req.params.id]);
      await unlink(join(uploadsDir, rows[0].path)).catch(() => {});

      res.json({ success: true, message: 'Image supprimée' });
    } catch (err) {
      next(err);
    }
  }
}

export default ImageController;
