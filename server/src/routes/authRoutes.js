import { Router } from 'express';
import AuthController from '../controllers/AuthController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = Router();
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/logout', AuthController.logout);
router.get('/me', authMiddleware, AuthController.me);
router.get('/verify-email', AuthController.verifyEmail);
router.post('/verify-token', AuthController.verifyToken);
router.post('/forgot-password', AuthController.forgotPassword);
router.post('/reset-password', AuthController.resetPassword);

export default router;
