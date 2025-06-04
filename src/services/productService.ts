import pool from '../database/database';

interface Product {
  product_id: number;
  name: string;
  description?: string;
  price: number;
  category_id: number;
  created_at: string;
}


export const getAllProducts = async (): Promise<Product[]> => {
  const [rows] = await pool.query('SELECT * FROM products');
  return rows as Product[];
};
