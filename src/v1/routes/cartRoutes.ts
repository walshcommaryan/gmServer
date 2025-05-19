import express from 'express';
import cartController from '../../controllers/cartController';
import authMiddleware from '../../middleware/authMiddleware';

const router = express.Router();

router.get('/', authMiddleware.authenticate, cartController.getCart);
router.post('/', authMiddleware.authenticate, cartController.updateCart);
router.post('/merge', authMiddleware.authenticate, cartController.mergeCart);
router.delete('/clear', authMiddleware.authenticate, cartController.clearCart)
router.delete('/:productId', authMiddleware.authenticate, cartController.removeFromCart);

export default router;
