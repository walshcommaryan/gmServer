export const ORDER_STATUSES = [
  "PENDING",
  "PAID",
  "PICKED UP",
  "CANCELLED",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export interface Order {
  order_id: number;
  customer_id: number;
  order_date: Date;
  status: OrderStatus;
  total_amount: number;
}
