"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cartController_1 = __importDefault(require("../../controllers/cartController"));
const authMiddleware_1 = require("../../middleware/authMiddleware");
const router = express_1.default.Router();
router.get("/", authMiddleware_1.authenticate, cartController_1.default.getCart);
router.post("/", authMiddleware_1.authenticate, cartController_1.default.updateCart);
router.post("/merge", authMiddleware_1.authenticate, cartController_1.default.mergeCart);
router.delete("/clear", authMiddleware_1.authenticate, cartController_1.default.clearCart);
router.delete("/:productId", authMiddleware_1.authenticate, cartController_1.default.removeFromCart);
exports.default = router;
//# sourceMappingURL=cartRoutes.js.map