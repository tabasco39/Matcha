import multer from 'multer';
import { fileURLToPath } from 'url';
import { dirname, join, extname } from 'path';
import { randomBytes } from 'crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));

const storage = multer.diskStorage({
  destination: join(__dirname, '../../uploads'),
  filename: (_req, file, cb) => {
    const ext = extname(file.originalname).toLowerCase();
    cb(null, randomBytes(16).toString('hex') + ext);
  },
});

const fileFilter = (_req, file, cb) => {
  if (file.mimetype.startsWith('image/')) cb(null, true);
  else cb(Object.assign(new Error('Seules les images sont acceptées'), { status: 400 }), false);
};

export default multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 Mo
});
