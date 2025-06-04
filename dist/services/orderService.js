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
const ALLOWED_SORT_FIELDS = ['order_date', 'total_amount', 'status', 'customer_id'];
const getAllOrders = (filters, sortOptions) => __awaiter(void 0, void 0, void 0, function* () {
    let query = 'SELECT * FROM orders';
    const params = [];
    const conditions = [];
    if (filters.order_id !== undefined) {
        conditions.push('order_id = ?');
        params.push(filters.order_id);
    }
    if (filters.customer_id !== undefined) {
        conditions.push('customer_id = ?');
        params.push(filters.customer_id);
    }
    if (filters.status) {
        conditions.push('status = ?');
        params.push(filters.status);
    }
    if (filters.order_date) {
        conditions.push('DATE(order_date) = ?');
        params.push(filters.order_date);
    }
    if (filters.total_amount !== undefined) {
        conditions.push('total_amount = ?');
        params.push(filters.total_amount);
    }
    if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
    }
    if (filters && sortOptions.sortBy && ALLOWED_SORT_FIELDS.includes(sortOptions.sortBy)) {
        query += ` ORDER BY ${sortOptions.sortBy} ${sortOptions.order.toUpperCase()}`;
    }
    const [rows] = yield database_1.default.query(query, params);
    return rows;
});
exports.getAllOrders = getAllOrders;
const getOneOrder = (order_id) => __awaiter(void 0, void 0, void 0, function* () {
    const [rows] = yield database_1.default.query('SELECT * FROM orders WHERE order_id = ?', [order_id]);
    return rows[0];
});
const createOneOrder = (newOrder) => __awaiter(void 0, void 0, void 0, function* () {
    const [result] = yield database_1.default.query(`INSERT INTO orders (customer_id, order_date, status, total_amount)
     VALUES (?, ?, ?, ?)`, [newOrder.customer_id, newOrder.order_date, newOrder.status, newOrder.total_amount]);
    return getOneOrder(result.insertId);
});
const updateOneOrder = (updatedOrder) => __awaiter(void 0, void 0, void 0, function* () {
    yield database_1.default.query(`UPDATE orders
     SET order_date = COALESCE(?, order_date),
         status = COALESCE(?, status),
         total_amount = COALESCE(?, total_amount)
     WHERE order_id = ?`, [updatedOrder.order_date, updatedOrder.status, updatedOrder.total_amount, updatedOrder.order_id]);
    return getOneOrder(updatedOrder.order_id);
});
const deleteOneOrder = (order_id) => __awaiter(void 0, void 0, void 0, function* () {
    const [result] = yield database_1.default.query('DELETE FROM orders WHERE order_id = ?', [order_id]);
    return result;
});
exports.default = {
    getAllOrders: exports.getAllOrders,
    getOneOrder,
    createOneOrder,
    updateOneOrder,
    deleteOneOrder,
};
