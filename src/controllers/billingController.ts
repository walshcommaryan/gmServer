const billingService = require("../services/billingService.js");
import { Request, Response } from "express";

import orderService from "../services/orderService";
import { getCartItemsByCustomerId } from "../services/cartService";
import { Order } from "../models/Order";

const createCheckoutSession = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const customerId = req.user?.customer_id;
    const { location, pickup_date } = req.body;

    console.log("📩 req.body from client:", req.body);

    if (!customerId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const cartItems = await getCartItemsByCustomerId(customerId);
    if (!cartItems || cartItems.length === 0) {
      res.status(400).json({ error: "Cart is empty" });
      return;
    }

    const total = cartItems.reduce((sum, item: any) => {
      return sum + (item.price || 0) * (item.quantity || 0);
    }, 0);

    const orderPayload: Order = {
      order_id: 0,
      customer_id: customerId,
      status: "PENDING",
      order_date: new Date(),
      total_amount: total,
      location,
      pickup_date: new Date(pickup_date),
    };

    let pendingOrder: Order | undefined =
      await orderService.getPendingOrderForCustomer(customerId);

    if (pendingOrder) {
      await orderService.updateOneOrder({
        order_id: pendingOrder.order_id,
        location,
        pickup_date: new Date(pickup_date),
      });
    } else {
      const newOrder = await orderService.createOneOrder(orderPayload);
      if (!newOrder) {
        res.status(500).json({ error: "Failed to create pending order" });
        return;
      }
      pendingOrder = newOrder;
    }

    const paymentLink = await billingService.createCheckoutSession({
      items: cartItems,
      orderId: pendingOrder.order_id,
    });

    res.status(200).json({ url: paymentLink.url });
  } catch (error) {
    console.error("Error creating Square payment link:", error);
    res.status(500).json({ error: "Failed to create payment link" });
  }
};


export default {
  createCheckoutSession,
};
