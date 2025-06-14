"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const billingService = require("../services/billingService.js");
const orderService_1 = __importDefault(require("../services/orderService"));
const cartService_1 = require("../services/cartService");
const createCheckoutSession = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const customerId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.customer_id;
        if (!customerId) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }
        const cartItems = yield (0, cartService_1.getCartItemsByCustomerId)(customerId);
        if (!cartItems || cartItems.length === 0) {
            res.status(400).json({ error: "Cart is empty" });
            return;
        }
        const total = cartItems.reduce((sum, item) => {
            return sum + (item.price || 0) * (item.quantity || 0);
        }, 0);
        const orderPayload = {
            order_id: 0,
            customer_id: customerId,
            status: "PENDING",
            order_date: new Date(),
            total_amount: total,
        };
        let pendingOrder = yield orderService_1.default.getPendingOrderForCustomer(customerId);
        if (pendingOrder) {
            yield orderService_1.default.updateOrderItems(pendingOrder.order_id, cartItems);
        }
        else {
            const newOrder = yield orderService_1.default.createOneOrder(orderPayload);
            if (!newOrder) {
                res.status(500).json({ error: "Failed to create pending order" });
                return;
            }
            pendingOrder = newOrder;
        }
        const paymentLink = yield billingService.createCheckoutSession({
            items: cartItems,
            orderId: pendingOrder.order_id,
        });
        res.status(200).json({ url: paymentLink.url });
    }
    catch (error) {
        console.error("Error creating Square payment link:", error);
        res.status(500).json({ error: "Failed to create payment link" });
    }
});
exports.default = {
    createCheckoutSession,
};
//# sourceMappingURL=billingController.js.map