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
exports.getCustomerById = void 0;
// services/customerService.ts
const database_1 = __importDefault(require("../database/database"));
const getCustomerById = (customerId) => __awaiter(void 0, void 0, void 0, function* () {
    const [rows] = yield database_1.default.query(`SELECT email, CONCAT(first_name, ' ', last_name) AS name FROM customers WHERE customer_id = ?`, [customerId]);
    if (!rows[0])
        throw new Error("Customer not found");
    return rows[0];
});
exports.getCustomerById = getCustomerById;
exports.default = {
    getCustomerById: exports.getCustomerById,
};
//# sourceMappingURL=customerService.js.map