import { RowDataPacket, ResultSetHeader } from "mysql2";
import db from "../database/database";
import { Order } from "../models/Order";

interface CartItemRow extends RowDataPacket {
  product_id: number;
  quantity: number;
  price: number;
}

type OrderRow = Order & RowDataPacket;

const getOneOrder = async (orderId: number): Promise<Order | undefined> => {
  if (typeof orderId !== "number" || isNaN(orderId)) {
    console.error("❌ getOneOrder: Invalid order_id:", orderId);
    console.trace();
    return undefined;
  }

  const [rows] = await db.query<RowDataPacket[]>(
    `SELECT * FROM orders WHERE order_id = ?`,
    [orderId],
  );

  return rows[0] as Order | undefined;
};

const createOneOrder = async (newOrder: Order): Promise<Order | undefined> => {
  const [result] = await db.query<ResultSetHeader>(
    `INSERT INTO orders (customer_id, order_date, status, total_amount, location, pickup_date)
      VALUES (?, ?, ?, ?, ?, ?)`,
    [
      newOrder.customer_id,
      newOrder.order_date,
      newOrder.status,
      newOrder.total_amount,
      newOrder.location,
      newOrder.pickup_date,
    ],
  );

  if (!result.insertId) {
    console.error("❌ Insert failed: No insertId returned.");
    return undefined;
  }

  return {
    ...newOrder,
    order_id: result.insertId,
  };
};

const updateOneOrder = async (
  updatedOrder: Partial<Order>,
): Promise<Order | undefined> => {
  const orderId = updatedOrder.order_id;

  if (typeof orderId !== "number" || isNaN(orderId)) {
    console.error("❌ updateOneOrder: Invalid or missing order_id");
    return undefined;
  }

  const [result] = await db.query<ResultSetHeader>(
    `UPDATE orders
     SET order_date = COALESCE(?, order_date),
      status = COALESCE(?, status),
      total_amount = COALESCE(?, total_amount),
      location = COALESCE(?, location),
      pickup_date = COALESCE(?, pickup_date)
     WHERE order_id = ?`,
    [
      updatedOrder.order_date,
      updatedOrder.status,
      updatedOrder.total_amount,
      updatedOrder.location,
      updatedOrder.pickup_date,
      orderId,
    ],
  );

  if (result.affectedRows === 0) {
    console.warn(`⚠️ updateOneOrder: No rows affected for order_id ${orderId}`);
  }
};

const getPendingOrderForCustomer = async (customerId: number) => {
  const [rows] = await db.query<OrderRow[]>(
    "SELECT * FROM orders WHERE customer_id = ? AND status = 'PENDING' ORDER BY order_date DESC LIMIT 1",
    [customerId],
  );
  return rows[0];
};

const getMostRecentPaidOrderForCustomer = async (
  customerId: number,
): Promise<Order | undefined> => {
  const [rows] = await db.query<RowDataPacket[]>(
    `SELECT * FROM orders
     WHERE customer_id = ? AND status = 'PAID'
     ORDER BY order_date DESC
     LIMIT 1`,
    [customerId],
  );

  if (rows.length === 0) return undefined;

  return rows[0] as Order;
};

const getAllPaidOrdersByCustomer = async (customerId: number) => {
  const [orders] = await db.query(
    `SELECT * FROM orders WHERE customer_id = ? AND status = 'PAID' ORDER BY order_date DESC`,
    [customerId],
  );
  return orders;
};

const archiveCartToOrderItems = async (
  orderId: number,
  cartId: number,
): Promise<void> => {
  const [rows] = await db.query<CartItemRow[]>(
    `SELECT ci.product_id, ci.quantity, p.price
   FROM cart_items ci
   JOIN products p ON ci.product_id = p.product_id
   WHERE ci.cart_id = ?`,
    [cartId],
  );

  for (const item of rows) {
    await db.query(
      `INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)`,
      [orderId, item.product_id, item.quantity, item.price],
    );
  }
};

const getItemsByOrderId = async (orderId: number) => {
  const [rows] = await db.query<RowDataPacket[]>(
    `SELECT 
      p.product_id,
      p.name,
      p.price,
      p.pack_size,
      oi.quantity
    FROM order_items oi
    JOIN products p ON oi.product_id = p.product_id
    WHERE oi.order_id = ?`,
    [orderId],
  );

  return (rows as any[]).map((row) => ({
    ...row,
    price: Number(row.price),
  }));
};

export default {
  getOneOrder,
  createOneOrder,
  updateOneOrder,
  getPendingOrderForCustomer,
  getMostRecentPaidOrderForCustomer,
  getAllPaidOrdersByCustomer,
  archiveCartToOrderItems,
  getItemsByOrderId,
};
