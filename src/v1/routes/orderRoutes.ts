import express, { Request, Response } from "express";
import orderController from "../../controllers/orderController";
import { authenticate } from "../../middleware/authMiddleware";
const router = express.Router();

router.get(
  "/payment-confirm",
  authenticate,
  orderController.handlePaymentConfirm,
);
router.get("/check-payment", orderController.checkPaymentStatus);
router.get("/latest-paid", authenticate, orderController.getLatestPaidOrder);
router.post("/reset-confirmation", orderController.resetPaymentConfirmed);
router.get("/history", authenticate, orderController.getOrderHistory);
router.get("/:orderId/items", authenticate, orderController.getOrderItems);

router.get("/", orderController.getAllOrders);
router.get("/:orderId", orderController.getOneOrder);
router.post("/", orderController.createOneOrder);
router.patch("/", orderController.updateOneOrder);
router.delete("/:orderId", orderController.deleteOneOrder);

export default router;
