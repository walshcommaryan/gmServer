import express from 'express';
import authController from '../../controllers/authController';
import authMiddleware from '../../middleware/authMiddleware';

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', authMiddleware.authenticate, authController.getMe);
router.post('/logout', authController.logout);

export default router;
