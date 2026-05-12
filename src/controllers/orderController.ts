import { Request, Response } from "express";
import orderService from "../services/orderService";
import session from "express-session";

import {
  getActiveCartMetaByCustomerId,
  clearItemsInCart,
  deactivateCart,
  createNewActiveCart,
} from "../services/cartService";
import customerService from "../services/customerService";
import notificationService from "../services/notificationService";

interface SessionRequest extends Request {
  session: session.Session & { paymentConfirmed?: boolean };
}

const handlePaymentConfirm = async (
  req: SessionRequest,
  res: Response,
): Promise<void> => {
  try {
    const customerId = req.user?.customer_id;

    if (typeof customerId !== "number") {
      res.status(401).send("Unauthorized: missing customer ID");
      return;
    }

    // 1. Get pending order
    const pendingOrder =
      await orderService.getPendingOrderForCustomer(customerId);

    if (!pendingOrder) {
      res.status(404).send("No pending order found to confirm");
      return;
    }

    // 2. Mark order as PAID
    await orderService.updateOneOrder({
      order_id: pendingOrder.order_id,
      status: "PAID",
      order_date: new Date(),
    });

    // 3. Get active cart
    const cart = await getActiveCartMetaByCustomerId(customerId);

    if (!cart || !cart.cart_id) {
      res.status(404).send("No active cart found");
      return;
    }

    // 4. Archive cart items into order_items
    await orderService.archiveCartToOrderItems(
      pendingOrder.order_id,
      cart.cart_id,
    );

    // 5. Clear cart
    await clearItemsInCart(customerId);

    // 6. Deactivate cart
    await deactivateCart(cart.cart_id);

    // 7. Fresh cart for customer
    await createNewActiveCart(customerId);

    // 8. Send Order summary to customer
    const items = await orderService.getItemsByOrderId(pendingOrder.order_id);
    const customer = await customerService.getCustomerById(customerId);

    await notificationService.sendOrderSummaryEmail(
      customer.email,
      customer.name,
      pendingOrder.order_id,
      items,
      pendingOrder.total_amount,
      pendingOrder.location,
      pendingOrder.pickup_date
    );

    // 9. Send incoming order email to bakery staff
    await notificationService.sendIncomingOrderEmail(
      process.env.BUSINESS_OWNER_EMAIL || process.env.MAIL_USER || "ryw246@gmail.com",
      customer.name,
      pendingOrder.order_id,
      items,
      Number(pendingOrder.total_amount),
      pendingOrder.location,
      pendingOrder.pickup_date
    );


    // 10. Save session
    req.session.paymentConfirmed = true;
    await new Promise<void>((resolve, reject) => {
      req.session.save((err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    console.log("🧠 Final session before redirect:", req.session);
    res.redirect(`${process.env.CLIENT_URL}/summary`);
  } catch (error) {
    console.error("Payment confirmation error:", error);
    res.status(500).send("Failed to confirm payment");
  }
};

const checkPaymentStatus = async (
  req: SessionRequest,
  res: Response,
): Promise<void> => {
  try {
    console.log("🔍 /check-payment called");
    console.log("🍪 Session:", req.session);
    const wasConfirmed = req.session.paymentConfirmed === true;

    if (wasConfirmed) {
      res.status(200).json({ ok: true });
    } else {
      res.status(403).json({ ok: false });
    }
  } catch (error) {
    console.error("Error checking payment session:", error);
    res.status(500).send("Session check failed");
  }
};

const getLatestPaidOrder = async (
  req: SessionRequest,
  res: Response,
): Promise<void> => {
  try {
    const customerId = req.user?.customer_id;
    if (!customerId) {
      res.status(401).send("Unauthorized");
      return;
    }

    const order =
      await orderService.getMostRecentPaidOrderForCustomer(customerId);
    if (!order) res.status(404).send("No paid order found");

    res.status(200).json(order);
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to fetch latest paid order");
  }
};

const resetPaymentConfirmed = async (
  req: SessionRequest,
  res: Response,
): Promise<void> => {
  try {
    console.log("🧹 Resetting paymentConfirmed in session");
    req.session.paymentConfirmed = false;

    req.session.save((err) => {
      if (err) {
        console.error("⚠️ Failed to clear paymentConfirmed:", err);
        res.status(500).send("Failed to clear flag");
      } else {
        console.log("✅ paymentConfirmed manually reset");
        res.status(200).send("Cleared");
      }
    });
  } catch (err) {
    console.error("Error clearing session:", err);
    res.status(500).send("Session error");
  }
};

const getOrderHistory = async (req: Request, res: Response): Promise<void> => {
  console.log("🍪 Session:", req.session);
  console.log("🧑 User:", req.user);

  try {
    const customerId = req.user?.customer_id;
    if (!customerId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const orders = await orderService.getAllPaidOrdersByCustomer(customerId);
    res.json(orders);
  } catch (error) {
    console.error("Failed to get order history:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getOrderItems = async (req: Request, res: Response) => {
  const { orderId } = req.params;
  const customerId = req.user?.customer_id;

  if (!customerId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const orderIdNum = Number(orderId);
    if (!Number.isFinite(orderIdNum)) {
      res.status(400).json({ message: "Invalid order id" });
      return;
    }

    const order = await orderService.getOneOrder(orderIdNum);
    if (!order || order.customer_id !== customerId) {
      res.status(404).json({ message: "Order not found" });
      return;
    }

    const items = await orderService.getItemsByOrderId(orderIdNum);
    res.json(items);
  } catch (error) {
    console.error("Error fetching order items:", error);
    res.status(500).json({ message: "Failed to fetch order items" });
  }
};

export default {
  handlePaymentConfirm,
  checkPaymentStatus,
  getLatestPaidOrder,
  resetPaymentConfirmed,
  getOrderHistory,
  getOrderItems,
};
