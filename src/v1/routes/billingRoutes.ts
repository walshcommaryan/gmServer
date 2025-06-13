import express from "express";
import billingController from "../../controllers/billingController";

const router = express.Router();

router.post(
  "/create-checkout-session",
  billingController.createCheckoutSession,
);

export default router;
