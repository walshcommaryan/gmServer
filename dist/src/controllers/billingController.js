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
const billingService = require("../services/billingService.js");
const createCheckoutSession = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const paymentLink = yield billingService.createCheckoutSession(req.body);
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