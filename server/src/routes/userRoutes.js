import { Router } from 'express';
import UserController from '../controllers/UserController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = Router();

router.put('/profile', authMiddleware, UserController.updateProfile);

router.get('/', UserController.getAll);
router.get('/:id', UserController.getById);
router.post('/', UserController.create);
router.put('/:id', UserController.update);
router.delete('/:id', UserController.remove);

export default router;
