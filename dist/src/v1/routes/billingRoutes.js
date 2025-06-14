"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const billingController_1 = __importDefault(require("../../controllers/billingController"));
const authMiddleware_1 = require("../../middleware/authMiddleware");
const router = express_1.default.Router();
router.post("/create-checkout-session", authMiddleware_1.authenticate, billingController_1.default.createCheckoutSession);
exports.default = router;
//# sourceMappingURL=billingRoutes.js.map