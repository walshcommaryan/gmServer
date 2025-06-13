import express, { Request, Response } from "express";
import orderController from "../../controllers/orderController";
const router = express.Router();

router.get("/payment-confirm", orderController.handlePaymentConfirm);
router.get("/check-payment", orderController.checkPaymentStatus);

router.get("/", orderController.getAllOrders);
router.get("/:orderId", orderController.getOneOrder);
router.post("/", orderController.createOneOrder);
router.patch("/", orderController.updateOneOrder);
router.delete("/:orderId", orderController.deleteOneOrder);

export default router;
