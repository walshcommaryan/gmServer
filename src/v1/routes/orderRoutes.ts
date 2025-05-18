import express from "express";
import orderController from "../../controllers/orderController";

const router = express.Router();

// Order Routes
router.get("/", orderController.getAllOrders);
router.get("/:orderId", orderController.getOneOrder);
router.post("/", orderController.createOneOrder);
router.patch("/", orderController.updateOneOrder);
router.delete("/:orderId", orderController.deleteOneOrder);

export default router