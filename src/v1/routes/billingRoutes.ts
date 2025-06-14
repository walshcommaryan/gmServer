import express from "express";
import billingController from "../../controllers/billingController";
import { authenticate } from "../../middleware/authMiddleware";

const router = express.Router();

router.post(
  "/create-checkout-session",
  authenticate,
  billingController.createCheckoutSession,
);

export default router;
