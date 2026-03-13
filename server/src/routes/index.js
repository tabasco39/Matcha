import { Router } from 'express';
import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import imageRoutes from './imageRoutes.js';

const router = Router();

router.use('/auth',   authRoutes);
router.use('/users',  userRoutes);
router.use('/images', imageRoutes);

export default router;
