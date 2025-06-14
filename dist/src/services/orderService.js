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
const database_1 = __importDefault(require("../database/database"));
const ALLOWED_SORT_FIELDS = [
    "order_date",
    "total_amount",
    "status",
    "customer_id",
];
const getAllOrders = (filters, sortOptions) => __awaiter(void 0, void 0, void 0, function* () {
    let query = "SELECT * FROM orders";
    const params = [];
    const conditions = [];
    if (filters.order_id !== undefined) {
        conditions.push("order_id = ?");
        params.push(filters.order_id);
    }
    if (filters.customer_id !== undefined) {
        conditions.push("customer_id = ?");
        params.push(filters.customer_id);
    }
    if (filters.status) {
        conditions.push("status = ?");
        params.push(filters.status);
    }
    if (filters.order_date) {
        conditions.push("DATE(order_date) = ?");
        params.push(filters.order_date);
    }
    if (filters.total_amount !== undefined) {
        conditions.push("total_amount = ?");
        params.push(filters.total_amount);
    }
    if (conditions.length > 0) {
        query += " WHERE " + conditions.join(" AND ");
    }
    if (filters &&
        sortOptions.sortBy &&
        ALLOWED_SORT_FIELDS.includes(sortOptions.sortBy)) {
        query += ` ORDER BY ${sortOptions.sortBy} ${sortOptions.order.toUpperCase()}`;
    }
    const [rows] = yield database_1.default.query(query, params);
    return rows;
});
exports.getAllOrders = getAllOrders;
const getOneOrder = (orderId) => __awaiter(void 0, void 0, void 0, function* () {
    if (typeof orderId !== "number" || isNaN(orderId)) {
        console.error("❌ getOneOrder: Invalid order_id:", orderId);
        console.trace(); // <- Logs full stack trace
        return undefined;
    }
    const [rows] = yield database_1.default.query(`SELECT * FROM orders WHERE order_id = ?`, [orderId]);
    return rows[0];
});
const createOneOrder = (newOrder) => __awaiter(void 0, void 0, void 0, function* () {
    const [result] = yield database_1.default.query(`INSERT INTO orders (customer_id, order_date, status, total_amount)
     VALUES (?, ?, ?, ?)`, [
        newOrder.customer_id,
        newOrder.order_date,
        newOrder.status,
        newOrder.total_amount,
    ]);
    if (!result.insertId) {
        console.error("❌ Insert failed: No insertId returned.");
        return undefined;
    }
    return Object.assign(Object.assign({}, newOrder), { order_id: result.insertId });
});
const updateOneOrder = (updatedOrder) => __awaiter(void 0, void 0, void 0, function* () {
    const orderId = updatedOrder.order_id;
    if (typeof orderId !== "number" || isNaN(orderId)) {
        console.error("❌ updateOneOrder: Invalid or missing order_id");
        return undefined;
    }
    const [result] = yield database_1.default.query(`UPDATE orders
     SET order_date = COALESCE(?, order_date),
         status = COALESCE(?, status),
         total_amount = COALESCE(?, total_amount)
     WHERE order_id = ?`, [
        updatedOrder.order_date,
        updatedOrder.status,
        updatedOrder.total_amount,
        orderId,
    ]);
    if (result.affectedRows === 0) {
        console.warn(`⚠️ updateOneOrder: No rows affected for order_id ${orderId}`);
    }
});
const deleteOneOrder = (order_id) => __awaiter(void 0, void 0, void 0, function* () {
    const [result] = yield database_1.default.query("DELETE FROM orders WHERE order_id = ?", [order_id]);
    return result;
});
const getPendingOrderForCustomer = (customerId) => __awaiter(void 0, void 0, void 0, function* () {
    const [rows] = yield database_1.default.query("SELECT * FROM orders WHERE customer_id = ? AND status = 'PENDING' ORDER BY order_date DESC LIMIT 1", [customerId]);
    return rows[0];
});
const updateOrderItems = (orderId, items) => __awaiter(void 0, void 0, void 0, function* () {
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    yield database_1.default.query(`UPDATE orders SET total_amount = ? WHERE order_id = ?`, [
        total,
        orderId,
    ]);
});
const getMostRecentPaidOrderForCustomer = (customerId) => __awaiter(void 0, void 0, void 0, function* () {
    const [rows] = yield database_1.default.query(`SELECT * FROM orders
     WHERE customer_id = ? AND status = 'PAID'
     ORDER BY order_date DESC
     LIMIT 1`, [customerId]);
    if (rows.length === 0)
        return undefined;
    return rows[0];
});
const getAllPaidOrdersByCustomer = (customerId) => __awaiter(void 0, void 0, void 0, function* () {
    const [orders] = yield database_1.default.query(`SELECT * FROM orders WHERE customer_id = ? AND status = 'PAID' ORDER BY order_date DESC`, [customerId]);
    return orders;
});
const archiveCartToOrderItems = (orderId, cartId) => __awaiter(void 0, void 0, void 0, function* () {
    const [rows] = yield database_1.default.query(`SELECT ci.product_id, ci.quantity, p.price
   FROM cart_items ci
   JOIN products p ON ci.product_id = p.product_id
   WHERE ci.cart_id = ?`, [cartId]);
    for (const item of rows) {
        yield database_1.default.query(`INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)`, [orderId, item.product_id, item.quantity, item.price]);
    }
});
const getItemsByOrderId = (orderId) => __awaiter(void 0, void 0, void 0, function* () {
    const [rows] = yield database_1.default.query(`SELECT 
      p.product_id,
      p.name,
      p.price,
      p.pack_size,
      oi.quantity
    FROM order_items oi
    JOIN products p ON oi.product_id = p.product_id
    WHERE oi.order_id = ?`, [orderId]);
    return rows.map((row) => (Object.assign(Object.assign({}, row), { price: Number(row.price) })));
});
exports.default = {
    getAllOrders: exports.getAllOrders,
    getOneOrder,
    createOneOrder,
    updateOneOrder,
    deleteOneOrder,
    getPendingOrderForCustomer,
    updateOrderItems,
    getMostRecentPaidOrderForCustomer,
    getAllPaidOrdersByCustomer,
    archiveCartToOrderItems,
    getItemsByOrderId,
};
//# sourceMappingURL=orderService.js.map