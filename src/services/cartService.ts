import { RowDataPacket, ResultSetHeader } from 'mysql2';
import db from '../database/database';
import { Cart } from '../models/Cart';

type CartRow = Cart & RowDataPacket;

// Get active cart items for a customer
export const getCartByCustomerId = async (customerId: number): Promise<Cart[] | undefined> => {
  const [rows] = await db.query<CartRow[]>(
    `SELECT 
      ci.cart_item_id,
      ci.quantity,
      p.product_id,
      p.name,
      p.price
    FROM carts c
    JOIN cart_items ci ON c.cart_id = ci.cart_id
    JOIN products p ON ci.product_id = p.product_id
    WHERE c.customer_id = ? AND c.is_active = TRUE`,
    [customerId]
  );

  return rows;
};

// Ensure an active cart exists, otherwise create one
export const getOrCreateActiveCart = async (customerId: number) => {
  const [existingCart] = await db.query<CartRow[]>(
    'SELECT cart_id FROM carts WHERE customer_id = ? AND is_active = TRUE',
    [customerId]
  );

  if (existingCart.length > 0) {
    return existingCart[0].cart_id;
  }

  const [newCart] = await db.query<ResultSetHeader>(
    'INSERT INTO carts (customer_id) VALUES (?)',
    [customerId]
  );
  
  return newCart.insertId;
};

export const updateCartItem = async (
  customerId: number,
  productId: number,
  quantity: number
) => {
  const cartId = await getOrCreateActiveCart(customerId);

  if (quantity <= 0) {
    // Remove item if quantity 0 or less
    await db.query(
      'DELETE FROM cart_items WHERE cart_id = ? AND product_id = ?',
      [cartId, productId]
    );
    return;
  }

  // Insert or update to set exact quantity
  await db.query(
    `INSERT INTO cart_items (cart_id, product_id, quantity)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE quantity = VALUES(quantity)`,
    [cartId, productId, quantity]
  );
};

export const mergeCartItem = async (
  cartId: number,
  productId: number,
  quantityToAdd: number
) => {
  // Try to get the existing quantity
  const [rows] = await db.query<RowDataPacket[]>(
    'SELECT quantity FROM cart_items WHERE cart_id = ? AND product_id = ?',
    [cartId, productId]
  );

  if (rows.length > 0) {
    const newQuantity = rows[0].quantity + quantityToAdd;

    await db.query(
      'UPDATE cart_items SET quantity = ? WHERE cart_id = ? AND product_id = ?',
      [newQuantity, cartId, productId]
    );
  } else {
    await db.query(
      'INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (?, ?, ?)',
      [cartId, productId, quantityToAdd]
    );
  }
};



// Remove an item from the cart
export const removeItemFromCart = async (
  customerId: number,
  productId: number
) => {
  const [cartRow] = await db.query<CartRow[]>(
    'SELECT cart_id FROM carts WHERE customer_id = ? AND is_active = TRUE',
    [customerId]
  );

  if (cartRow.length === 0) return false;

  const cartId = cartRow[0].id;

  const [result] = await db.query<ResultSetHeader>(
    'DELETE FROM cart_items WHERE cart_id = ? AND product_id = ?',
    [cartId, productId]
  );

  return result.affectedRows > 0;
};


// Clear all items from the cart
export const clearItemsInCart = async (
  customerId: number
) => {
  const cartId = await getOrCreateActiveCart(customerId);

  const [result] = await db.query<ResultSetHeader>(
    'DELETE FROM cart_items WHERE cart_id = ?',
    [cartId]
  );

  return result.affectedRows > 0;
};
