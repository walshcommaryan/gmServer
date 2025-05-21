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
const getAllOrders = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { order_id, customer_id, status, order_date, total_amount, sortBy, order } = req.query;
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
            order: order || 'asc',
        };
        const orders = yield orderService_1.default.getAllOrders(filters, sortOptions);
        res.status(200).json(orders);
    }
    catch (error) {
        console.error(error);
        res.status(500).send('Failed to fetch orders');
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
        }
        const updatedOrder = yield orderService_1.default.updateOneOrder(modifiedOrder);
        if (!updatedOrder) {
            res.status(404).json("Order ID not found.");
        }
        res.status(200).json(updatedOrder);
    }
    catch (error) {
        console.log(error);
        res.status(500).send(`Failed to update order with ID ${modifiedOrder.order_id}`);
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
exports.default = {
    getAllOrders: exports.getAllOrders,
    getOneOrder,
    createOneOrder,
    updateOneOrder,
    deleteOneOrder,
};
