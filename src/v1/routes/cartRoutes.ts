import express from "express";
import cartController from "../../controllers/cartController";
import { authenticate } from "../../middleware/authMiddleware";

const router = express.Router();

router.get("/", authenticate, cartController.getCart);
router.post("/", authenticate, cartController.updateCart);
router.post("/merge", authenticate, cartController.mergeCart);
router.delete("/clear", authenticate, cartController.clearCart);
router.delete("/:productId", authenticate, cartController.removeFromCart);

export default router;
