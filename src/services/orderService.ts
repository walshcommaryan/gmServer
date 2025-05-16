import { RowDataPacket, ResultSetHeader } from 'mysql2';
import db from '../database/database';
import { Order } from '../models/Order';

type OrderRow = Order & RowDataPacket;

interface Filters {
  customer_id?: number;
  status?: string;
  order_date?: string;
  total_amount?: number;
}

interface SortOptions {
  sortBy?: string;
  order: 'asc' | 'desc';
}

const ALLOWED_SORT_FIELDS = ['orderDate', 'total_amount', 'status', 'customerId'];

export const getAllOrders = async (
  filters: Filters,
  sortOptions: SortOptions
): Promise<Order[]> => {
  let query = 'SELECT * FROM orders';
  const params: any[] = [];
  const conditions: string[] = [];

  // Dynamic WHERE clauses
  if (filters.customer_id !== undefined) {
    conditions.push('customer_id = ?');
    params.push(filters.customer_id);
  }

  if (filters.status) {
    conditions.push('status = ?');
    params.push(filters.status);
  }

  if (filters.order_date) {
    conditions.push('DATE(order_date) = ?');
    params.push(filters.order_date);
  }

  if (filters.total_amount !== undefined) {
    conditions.push('total_amount = ?');
    params.push(filters.total_amount);
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  // Add ORDER BY
  if (filters && sortOptions.sortBy && ALLOWED_SORT_FIELDS.includes(sortOptions.sortBy)) {
    query += ` ORDER BY ${sortOptions.sortBy} ${sortOptions.order.toUpperCase()}`;
  }

  const [rows] = await db.query<OrderRow[]>(query, params);
  return rows;
};



const getOneOrder = async (orderId: string): Promise<Order | undefined> => {
  const [rows] = await db.query<OrderRow[]>(
    'SELECT * FROM orders WHERE order_id = ?',
    [orderId]
  );
  return rows[0];
};

const createOneOrder = async (newOrder: Order): Promise<Order | undefined> => {
  const [result] = await db.query<ResultSetHeader>(
    `INSERT INTO orders (customer_id, order_date, status, total_amount)
     VALUES (?, ?, ?, ?)`,
    [newOrder.customer_id, newOrder.order_date, newOrder.status, newOrder.total_amount]
  );
  return getOneOrder(result.insertId.toString());
};

const updateOneOrder = async (updatedOrder: Partial<Order>): Promise<Order | undefined> => {
  await db.query<ResultSetHeader>(
    `UPDATE orders
     SET order_date = COALESCE(?, order_date),
         status = COALESCE(?, status),
         total_amount = COALESCE(?, total_amount)
     WHERE order_id = ?`,
    [updatedOrder.order_date, updatedOrder.status, updatedOrder.total_amount, updatedOrder.order_id]
  );
  return getOneOrder(updatedOrder.order_id!);
};

const deleteOneOrder = async (orderId: string): Promise<ResultSetHeader> => {
  const [result] = await db.query<ResultSetHeader>(
    'DELETE FROM orders WHERE order_id = ?',
    [orderId]
  );
  return result;
};

export default {
  getAllOrders,
  getOneOrder,
  createOneOrder,
  updateOneOrder,
  deleteOneOrder,
};
