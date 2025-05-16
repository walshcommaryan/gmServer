import express, { Request, Response } from "express";
import orderController from "../../controllers/orderController";

const router = express.Router();

// Registration Routes

// Order Routes
router.get("/orders/", orderController.getAllOrders);
router.get("/order/:orderId", orderController.getOneOrder);
router.post("/order/", orderController.createOneOrder);
router.patch("/order/", orderController.updateOneOrder);
router.delete("/order/:orderId", orderController.deleteOneOrder);

export default router