"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const orderController_1 = __importDefault(require("../../controllers/orderController"));
const router = express_1.default.Router();
// Order Routes
router.get("/", orderController_1.default.getAllOrders);
router.get("/:orderId", orderController_1.default.getOneOrder);
router.post("/", orderController_1.default.createOneOrder);
router.patch("/", orderController_1.default.updateOneOrder);
router.delete("/:orderId", orderController_1.default.deleteOneOrder);
exports.default = router;
