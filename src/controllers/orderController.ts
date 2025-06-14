import { Request, Response } from "express";
import orderService from "../services/orderService";
import { Order } from "../models/Order";
import session from "express-session";

import {
  getActiveCartMetaByCustomerId,
  clearItemsInCart,
  deactivateCart,
  createNewActiveCart,
} from "../services/cartService";

interface OrderParams {
  order_id: number;
}

interface SessionRequest extends Request {
  session: session.Session & { paymentConfirmed?: boolean };
}

export const getAllOrders = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const {
      order_id,
      customer_id,
      status,
      order_date,
      total_amount,
      sortBy,
      order,
    } = req.query;

    const orderIdNum = Number(order_id);
    const customerIdNum = Number(customer_id);
    const filters = {
      order_id: !isNaN(orderIdNum) ? orderIdNum : undefined,
      customer_id: !isNaN(customerIdNum) ? customerIdNum : undefined,
      status: status as string | undefined,
      order_date: order_date as string | undefined,
      total_amount: total_amount ? Number(total_amount) : undefined,
    };

    const sortOptions = {
      sortBy: sortBy as string | undefined,
      order: (order as "asc" | "desc") || "asc",
    };

    const orders = await orderService.getAllOrders(filters, sortOptions);
    res.status(200).json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).send("Failed to fetch orders");
  }
};

const getOneOrder = async (
  req: Request<OrderParams>,
  res: Response,
): Promise<void> => {
  const { order_id } = req.params;
  try {
    const order = await orderService.getOneOrder(Number(order_id));
    res.status(200).json(order);
  } catch (error) {
    console.log(error);
    res.status(500).send(`Failed to fetch order_id ${order_id}`);
  }
};

const createOneOrder = async (
  req: Request<{}, {}, Order>,
  res: Response,
): Promise<void> => {
  const newOrder = req.body;

  try {
    const createdOrder = await orderService.createOneOrder(newOrder);
    res.status(201).json(createdOrder);
  } catch (error) {
    console.log(error);
    res.status(500).send(`Failed to create order with ID ${newOrder.order_id}`);
  }
};

const updateOneOrder = async (
  req: Request<{}, {}, Order>,
  res: Response,
): Promise<void> => {
  const modifiedOrder = req.body;
  try {
    if (!modifiedOrder.order_id) {
      res.status(404).json("Order ID not found.");
      return;
    }

    const updatedOrder = await orderService.updateOneOrder(modifiedOrder);

    if (!updatedOrder) {
      res.status(404).json("Order ID not found.");
      return;
    }

    res.status(200).json(updatedOrder);
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send(`Failed to update order with ID ${modifiedOrder.order_id}`);
  }
};

const deleteOneOrder = async (
  req: Request<OrderParams>,
  res: Response,
): Promise<void> => {
  const { order_id } = req.params;

  try {
    const deleted = await orderService.deleteOneOrder(order_id);
    if (deleted.affectedRows > 0) {
      res.status(202).send(`Order ${order_id} deleted successfully`);
    } else {
      res.status(404).send(`Order ${order_id} not found`);
    }
  } catch (error) {
    console.log(error);
    res.status(500).send(`Failed to delete order with ID ${order_id}`);
  }
};

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

    // 8. Save session
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
  try {
    const items = await orderService.getItemsByOrderId(Number(orderId));
    res.json(items);
  } catch (error) {
    console.error("Error fetching order items:", error);
    res.status(500).json({ message: "Failed to fetch order items" });
  }
};

export default {
  getAllOrders,
  getOneOrder,
  createOneOrder,
  updateOneOrder,
  deleteOneOrder,
  handlePaymentConfirm,
  checkPaymentStatus,
  getLatestPaidOrder,
  resetPaymentConfirmed,
  getOrderHistory,
  getOrderItems,
};
