import { Request, Response } from "express";
import orderService from "../services/orderService";
import { Order } from "../models/Order";
import session from "express-session";

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
    req.session.paymentConfirmed = true;

    res.setHeader(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate",
    );
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    res.setHeader("Surrogate-Control", "no-store");

    req.session.save((err) => {
      if (err) {
        console.error("❌ Failed to save session:", err);
        return res.status(500).send("Session not saved");
      }

      console.log("✅ Session saved with:", req.session);
      res.redirect(`${process.env.CLIENT_URL}/summary`);
    });
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
    console.log("🔍 Incoming cookie header:", req.headers.cookie);
    console.log("🔍 Session object:", req.session);

    const wasConfirmed = req.session.paymentConfirmed === true;

    if (wasConfirmed) {
      req.session.paymentConfirmed = false;
      req.session.save(() => {
        res.status(200).json({ ok: true });
      });
    } else {
      res.status(403).json({ ok: false });
    }
  } catch (error) {
    console.error("Error checking payment session:", error);
    res.status(500).send("Session check failed");
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
};
