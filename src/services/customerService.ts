// services/customerService.ts
import db from "../database/database";
import { RowDataPacket } from "mysql2";

interface CustomerRow extends RowDataPacket {
  email: string;
  name: string;
}

export const getCustomerById = async (
  customerId: number,
): Promise<{ email: string; name: string }> => {
  const [rows] = await db.query<CustomerRow[]>(
    `SELECT email, CONCAT(first_name, ' ', last_name) AS name FROM customers WHERE customer_id = ?`,
    [customerId],
  );

  if (!rows[0]) throw new Error("Customer not found");
  return rows[0];
};

export default {
  getCustomerById,
};
