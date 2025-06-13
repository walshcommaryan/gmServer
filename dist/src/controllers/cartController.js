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
Object.defineProperty(exports, "__esModule", { value: true });
const cartService_1 = require("../services/cartService");
// GET /cart
const getCart = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const customer_id = (_a = req.user) === null || _a === void 0 ? void 0 : _a.customer_id;
    if (!customer_id) {
        res.status(401).json({ message: "Unauthorized" });
    }
    try {
        const items = yield (0, cartService_1.getCartByCustomerId)(customer_id);
        res.json({ items });
    }
    catch (err) {
        console.error(err);
        res.status(500).send("Error fetching cart");
    }
});
const updateCart = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const customer_id = (_a = req.user) === null || _a === void 0 ? void 0 : _a.customer_id;
    if (!customer_id) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }
    const { product_id, quantity } = req.body;
    if (!product_id || quantity === undefined) {
        res.status(400).json({ message: "Product ID and quantity required" });
        return;
    }
    try {
        yield (0, cartService_1.updateCartItem)(customer_id, product_id, quantity);
        res.status(200).json({ message: "Cart updated" });
    }
    catch (err) {
        console.error(err);
        res.status(500).send("Error updating cart");
    }
});
const mergeCart = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const customer_id = (_a = req.user) === null || _a === void 0 ? void 0 : _a.customer_id;
    if (!customer_id) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }
    const items = req.body;
    if (!Array.isArray(items)) {
        res.status(400).json({ message: "Invalid items format" });
        return;
    }
    try {
        const cartId = yield (0, cartService_1.getOrCreateActiveCart)(customer_id);
        for (const item of items) {
            const { product_id, quantity } = item;
            if (product_id && quantity && quantity > 0) {
                yield (0, cartService_1.mergeCartItem)(cartId, product_id, quantity);
            }
        }
        res.status(200).json({ message: "Cart merged successfully" });
    }
    catch (err) {
        console.error(err);
        res.status(500).send("Error merging cart");
    }
});
// DELETE /cart/:productId
const removeFromCart = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const customer_id = (_a = req.user) === null || _a === void 0 ? void 0 : _a.customer_id;
    if (!customer_id) {
        res.status(401).json({ message: "Unauthorized" });
    }
    const { product_id } = req.body;
    if (isNaN(product_id)) {
        res.status(400).json({ message: "Invalid product ID" });
    }
    try {
        const removed = yield (0, cartService_1.removeItemFromCart)(customer_id, product_id);
        if (removed) {
            res.status(200).json({ message: "Item removed from cart" });
        }
        else {
            res.status(404).json({ message: "Item not found in cart" });
        }
    }
    catch (err) {
        console.error(err);
        res.status(500).send("Error removing item from cart");
    }
});
// DELETE clear cart
const clearCart = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const customer_id = (_a = req.user) === null || _a === void 0 ? void 0 : _a.customer_id;
    if (!customer_id) {
        res.status(401).json({ message: "Unauthorized" });
    }
    try {
        const removed = yield (0, cartService_1.clearItemsInCart)(customer_id);
        if (removed) {
            res.status(200).json({ message: "Items cleared from cart" });
        }
        else {
            res.status(200).json({ message: "No Items in cart to clear" });
        }
    }
    catch (err) {
        console.error(err);
        res.status(500).send("Error clearing items from cart");
    }
});
exports.default = {
    getCart,
    updateCart,
    mergeCart,
    removeFromCart,
    clearCart,
};
//# sourceMappingURL=cartController.js.map