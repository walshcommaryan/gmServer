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
exports.getAllOrders = void 0;
const orderService_1 = __importDefault(require("../services/orderService"));
const cartService_1 = require("../services/cartService");
const getAllOrders = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { order_id, customer_id, status, order_date, total_amount, sortBy, order, } = req.query;
        const orderIdNum = Number(order_id);
        const customerIdNum = Number(customer_id);
        const filters = {
            order_id: !isNaN(orderIdNum) ? orderIdNum : undefined,
            customer_id: !isNaN(customerIdNum) ? customerIdNum : undefined,
            status: status,
            order_date: order_date,
            total_amount: total_amount ? Number(total_amount) : undefined,
        };
        const sortOptions = {
            sortBy: sortBy,
            order: order || "asc",
        };
        const orders = yield orderService_1.default.getAllOrders(filters, sortOptions);
        res.status(200).json(orders);
    }
    catch (error) {
        console.error(error);
        res.status(500).send("Failed to fetch orders");
    }
});
exports.getAllOrders = getAllOrders;
const getOneOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { order_id } = req.params;
    try {
        const order = yield orderService_1.default.getOneOrder(Number(order_id));
        res.status(200).json(order);
    }
    catch (error) {
        console.log(error);
        res.status(500).send(`Failed to fetch order_id ${order_id}`);
    }
});
const createOneOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const newOrder = req.body;
    try {
        const createdOrder = yield orderService_1.default.createOneOrder(newOrder);
        res.status(201).json(createdOrder);
    }
    catch (error) {
        console.log(error);
        res.status(500).send(`Failed to create order with ID ${newOrder.order_id}`);
    }
});
const updateOneOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const modifiedOrder = req.body;
    try {
        if (!modifiedOrder.order_id) {
            res.status(404).json("Order ID not found.");
            return;
        }
        const updatedOrder = yield orderService_1.default.updateOneOrder(modifiedOrder);
        if (!updatedOrder) {
            res.status(404).json("Order ID not found.");
            return;
        }
        res.status(200).json(updatedOrder);
    }
    catch (error) {
        console.log(error);
        res
            .status(500)
            .send(`Failed to update order with ID ${modifiedOrder.order_id}`);
    }
});
const deleteOneOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { order_id } = req.params;
    try {
        const deleted = yield orderService_1.default.deleteOneOrder(order_id);
        if (deleted.affectedRows > 0) {
            res.status(202).send(`Order ${order_id} deleted successfully`);
        }
        else {
            res.status(404).send(`Order ${order_id} not found`);
        }
    }
    catch (error) {
        console.log(error);
        res.status(500).send(`Failed to delete order with ID ${order_id}`);
    }
});
const handlePaymentConfirm = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const customerId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.customer_id;
        if (typeof customerId !== "number") {
            res.status(401).send("Unauthorized: missing customer ID");
            return;
        }
        // 1. Get pending order
        const pendingOrder = yield orderService_1.default.getPendingOrderForCustomer(customerId);
        if (!pendingOrder) {
            res.status(404).send("No pending order found to confirm");
            return;
        }
        // 2. Mark order as PAID
        yield orderService_1.default.updateOneOrder({
            order_id: pendingOrder.order_id,
            status: "PAID",
            order_date: new Date(),
        });
        // 3. Get active cart
        const cart = yield (0, cartService_1.getActiveCartMetaByCustomerId)(customerId);
        if (!cart || !cart.cart_id) {
            res.status(404).send("No active cart found");
            return;
        }
        // 4. Archive cart items into order_items
        yield orderService_1.default.archiveCartToOrderItems(pendingOrder.order_id, cart.cart_id);
        // 5. Clear cart
        yield (0, cartService_1.clearItemsInCart)(customerId);
        // 6. Deactivate cart
        yield (0, cartService_1.deactivateCart)(cart.cart_id);
        // 7. Fresh cart for customer
        yield (0, cartService_1.createNewActiveCart)(customerId);
        // 8. Save session
        req.session.paymentConfirmed = true;
        yield new Promise((resolve, reject) => {
            req.session.save((err) => {
                if (err)
                    reject(err);
                else
                    resolve();
            });
        });
        console.log("🧠 Final session before redirect:", req.session);
        res.redirect(`${process.env.CLIENT_URL}/summary`);
    }
    catch (error) {
        console.error("Payment confirmation error:", error);
        res.status(500).send("Failed to confirm payment");
    }
});
const checkPaymentStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("🔍 /check-payment called");
        console.log("🍪 Session:", req.session);
        const wasConfirmed = req.session.paymentConfirmed === true;
        if (wasConfirmed) {
            res.status(200).json({ ok: true });
        }
        else {
            res.status(403).json({ ok: false });
        }
    }
    catch (error) {
        console.error("Error checking payment session:", error);
        res.status(500).send("Session check failed");
    }
});
const getLatestPaidOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const customerId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.customer_id;
        if (!customerId) {
            res.status(401).send("Unauthorized");
            return;
        }
        const order = yield orderService_1.default.getMostRecentPaidOrderForCustomer(customerId);
        if (!order)
            res.status(404).send("No paid order found");
        res.status(200).json(order);
    }
    catch (err) {
        console.error(err);
        res.status(500).send("Failed to fetch latest paid order");
    }
});
const resetPaymentConfirmed = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("🧹 Resetting paymentConfirmed in session");
        req.session.paymentConfirmed = false;
        req.session.save((err) => {
            if (err) {
                console.error("⚠️ Failed to clear paymentConfirmed:", err);
                res.status(500).send("Failed to clear flag");
            }
            else {
                console.log("✅ paymentConfirmed manually reset");
                res.status(200).send("Cleared");
            }
        });
    }
    catch (err) {
        console.error("Error clearing session:", err);
        res.status(500).send("Session error");
    }
});
const getOrderHistory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    console.log("🍪 Session:", req.session);
    console.log("🧑 User:", req.user);
    try {
        const customerId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.customer_id;
        if (!customerId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const orders = yield orderService_1.default.getAllPaidOrdersByCustomer(customerId);
        res.json(orders);
    }
    catch (error) {
        console.error("Failed to get order history:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
const getOrderItems = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { orderId } = req.params;
    try {
        const items = yield orderService_1.default.getItemsByOrderId(Number(orderId));
        res.json(items);
    }
    catch (error) {
        console.error("Error fetching order items:", error);
        res.status(500).json({ message: "Failed to fetch order items" });
    }
});
exports.default = {
    getAllOrders: exports.getAllOrders,
    getOneOrder,
    createOneOrder,
    updateOneOrder,
    deleteOneOrder,
    handlePaymentConfirm,
    checkPaymentStatus,
    getLatestPaidOrder,
    resetPaymentConfirmed,
    getOrderHistory,
    getOrderItems,
};
//# sourceMappingURL=orderController.js.map