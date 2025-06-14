"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const orderController_1 = __importDefault(require("../../controllers/orderController"));
const authMiddleware_1 = require("../../middleware/authMiddleware");
const router = express_1.default.Router();
router.get("/payment-confirm", authMiddleware_1.authenticate, orderController_1.default.handlePaymentConfirm);
router.get("/check-payment", orderController_1.default.checkPaymentStatus);
router.get("/latest-paid", authMiddleware_1.authenticate, orderController_1.default.getLatestPaidOrder);
router.post("/reset-confirmation", orderController_1.default.resetPaymentConfirmed);
router.get("/history", authMiddleware_1.authenticate, orderController_1.default.getOrderHistory);
router.get("/:orderId/items", authMiddleware_1.authenticate, orderController_1.default.getOrderItems);
router.get("/", orderController_1.default.getAllOrders);
router.get("/:orderId", orderController_1.default.getOneOrder);
router.post("/", orderController_1.default.createOneOrder);
router.patch("/", orderController_1.default.updateOneOrder);
router.delete("/:orderId", orderController_1.default.deleteOneOrder);
exports.default = router;
//# sourceMappingURL=orderRoutes.js.map