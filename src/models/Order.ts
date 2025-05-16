export const ORDER_STATUSES = ['PENDING', 'SHIPPED', 'DELIVERED', 'CANCELLED'] as const;
export type OrderStatus = typeof ORDER_STATUSES[number];

export interface Order {
  order_id: string;
  customer_id: string;
  order_date: Date;
  status: OrderStatus;
  total_amount: number;
}