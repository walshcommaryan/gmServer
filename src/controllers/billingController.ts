const billingService = require("../services/billingService.js");
import { Request, Response } from "express";

const createCheckoutSession = async (req: Request, res: Response) => {
  try {
    const paymentLink = await billingService.createCheckoutSession(req.body);
    res.status(200).json({ url: paymentLink.url });
  } catch (error) {
    console.error("Error creating Square payment link:", error);
    res.status(500).json({ error: "Failed to create payment link" });
  }
};

export default {
  createCheckoutSession,
};
