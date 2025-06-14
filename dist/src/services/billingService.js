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
const { Client, Environment } = require("square/legacy");
const crypto = require("crypto");
require("dotenv").config(); // Only this is needed
const squareClient = new Client({
    accessToken: process.env.SQUARE_ACCESS_TOKEN,
    environment: process.env.SQUARE_ENVIRONMENT === "production"
        ? Environment.Production
        : Environment.Sandbox,
});
const createCheckoutSession = (_a) => __awaiter(void 0, [_a], void 0, function* ({ items }) {
    const lineItems = items.map((item) => ({
        name: item.name,
        quantity: item.quantity.toString(),
        basePriceMoney: {
            amount: BigInt(Math.round(item.price * 100)),
            currency: "USD",
        },
    }));
    const idempotencyKey = crypto.randomUUID();
    const { result } = yield squareClient.checkoutApi.createPaymentLink({
        idempotencyKey,
        order: {
            locationId: process.env.SQUARE_LOCATION_ID,
            lineItems,
        },
        checkoutOptions: {
            redirectUrl: process.env.SQUARE_REDIRECT_URL,
        },
    });
    return result.paymentLink;
});
module.exports = {
    createCheckoutSession,
};
//# sourceMappingURL=billingService.js.map