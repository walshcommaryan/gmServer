const { Client, Environment } = require("square/legacy");
const crypto = require("crypto");
require("dotenv").config(); // Only this is needed

const squareClient = new Client({
  accessToken: process.env.SQUARE_ACCESS_TOKEN,
  environment:
    process.env.SQUARE_ENVIRONMENT === "production"
      ? Environment.Production
      : Environment.Sandbox,
});

const createCheckoutSession = async ({ items }) => {
  const lineItems = items.map((item) => ({
    name: item.name,
    quantity: item.quantity.toString(),
    basePriceMoney: {
      amount: BigInt(Math.round(item.price * 100)),
      currency: "USD",
    },
  }));

  const idempotencyKey = crypto.randomUUID();

  const { result } = await squareClient.checkoutApi.createPaymentLink({
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
};

module.exports = {
  createCheckoutSession,
};
