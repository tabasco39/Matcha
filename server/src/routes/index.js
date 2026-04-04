import { Router } from 'express';
import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import imageRoutes from './imageRoutes.js';
import likesRoutes from './likesRoutes.js';

const router = Router();

router.use('/auth',   authRoutes);
router.use('/users',  userRoutes);
router.use('/images', imageRoutes);
router.use('/likes', likesRoutes);

export default router;
