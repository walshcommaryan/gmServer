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
exports.clearItemsInCart = exports.removeItemFromCart = exports.mergeCartItem = exports.updateCartItem = exports.getOrCreateActiveCart = exports.getCartByCustomerId = void 0;
const database_1 = __importDefault(require("../database/database"));
// Get active cart items for a customer
const getCartByCustomerId = (customerId) => __awaiter(void 0, void 0, void 0, function* () {
    const [rows] = yield database_1.default.query(`SELECT 
      ci.cart_item_id,
      ci.quantity,
      p.product_id,
      p.name,
      p.price
    FROM carts c
    JOIN cart_items ci ON c.cart_id = ci.cart_id
    JOIN products p ON ci.product_id = p.product_id
    WHERE c.customer_id = ? AND c.is_active = TRUE`, [customerId]);
    return rows;
});
exports.getCartByCustomerId = getCartByCustomerId;
// Ensure an active cart exists, otherwise create one
const getOrCreateActiveCart = (customerId) => __awaiter(void 0, void 0, void 0, function* () {
    const [existingCart] = yield database_1.default.query("SELECT cart_id FROM carts WHERE customer_id = ? AND is_active = TRUE", [customerId]);
    if (existingCart.length > 0) {
        return existingCart[0].cart_id;
    }
    const [newCart] = yield database_1.default.query("INSERT INTO carts (customer_id) VALUES (?)", [customerId]);
    return newCart.insertId;
});
exports.getOrCreateActiveCart = getOrCreateActiveCart;
const updateCartItem = (customerId, productId, quantity) => __awaiter(void 0, void 0, void 0, function* () {
    const cartId = yield (0, exports.getOrCreateActiveCart)(customerId);
    if (quantity <= 0) {
        // Remove item if quantity 0 or less
        yield database_1.default.query("DELETE FROM cart_items WHERE cart_id = ? AND product_id = ?", [cartId, productId]);
        return;
    }
    // Insert or update to set exact quantity
    yield database_1.default.query(`INSERT INTO cart_items (cart_id, product_id, quantity)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE quantity = VALUES(quantity)`, [cartId, productId, quantity]);
});
exports.updateCartItem = updateCartItem;
const mergeCartItem = (cartId, productId, quantityToAdd) => __awaiter(void 0, void 0, void 0, function* () {
    // Try to get the existing quantity
    const [rows] = yield database_1.default.query("SELECT quantity FROM cart_items WHERE cart_id = ? AND product_id = ?", [cartId, productId]);
    if (rows.length > 0) {
        const newQuantity = rows[0].quantity + quantityToAdd;
        yield database_1.default.query("UPDATE cart_items SET quantity = ? WHERE cart_id = ? AND product_id = ?", [newQuantity, cartId, productId]);
    }
    else {
        yield database_1.default.query("INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (?, ?, ?)", [cartId, productId, quantityToAdd]);
    }
});
exports.mergeCartItem = mergeCartItem;
// Remove an item from the cart
const removeItemFromCart = (customerId, productId) => __awaiter(void 0, void 0, void 0, function* () {
    const [cartRow] = yield database_1.default.query("SELECT cart_id FROM carts WHERE customer_id = ? AND is_active = TRUE", [customerId]);
    if (cartRow.length === 0)
        return false;
    const cartId = cartRow[0].id;
    const [result] = yield database_1.default.query("DELETE FROM cart_items WHERE cart_id = ? AND product_id = ?", [cartId, productId]);
    return result.affectedRows > 0;
});
exports.removeItemFromCart = removeItemFromCart;
// Clear all items from the cart
const clearItemsInCart = (customerId) => __awaiter(void 0, void 0, void 0, function* () {
    const cartId = yield (0, exports.getOrCreateActiveCart)(customerId);
    const [result] = yield database_1.default.query("DELETE FROM cart_items WHERE cart_id = ?", [cartId]);
    return result.affectedRows > 0;
});
exports.clearItemsInCart = clearItemsInCart;
//# sourceMappingURL=cartService.js.map