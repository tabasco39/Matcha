import { Router } from 'express';
import ImageController from '../controllers/ImageController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import upload from '../config/multer.js';

const router = Router();

router.use(authMiddleware);

router.get('/',       ImageController.getMyImages);
router.post('/',      upload.single('image'), ImageController.upload);
router.delete('/:id', ImageController.remove);

export default router;
