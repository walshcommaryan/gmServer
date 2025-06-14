import { Request, Response } from "express";

import {
  getCartItemsByCustomerId,
  getOrCreateActiveCart,
  updateCartItem,
  mergeCartItem,
  removeItemFromCart,
  clearItemsInCart,
} from "../services/cartService";

// GET /cart
const getCart = async (req: Request, res: Response): Promise<void> => {
  const customer_id = req.user?.customer_id;
  if (!customer_id) {
    res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const items = await getCartItemsByCustomerId(customer_id!);
    res.json({ items });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching cart");
  }
};

const updateCart = async (req: Request, res: Response): Promise<void> => {
  const customer_id = req.user?.customer_id;
  if (!customer_id) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const { product_id, quantity } = req.body;

  if (!product_id || quantity === undefined) {
    res.status(400).json({ message: "Product ID and quantity required" });
    return;
  }

  try {
    await updateCartItem(customer_id, product_id, quantity);
    res.status(200).json({ message: "Cart updated" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error updating cart");
  }
};

const mergeCart = async (req: Request, res: Response): Promise<void> => {
  const customer_id = req.user?.customer_id;
  if (!customer_id) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const items = req.body;

  if (!Array.isArray(items)) {
    res.status(400).json({ message: "Invalid items format" });
    return;
  }

  try {
    const cartId = await getOrCreateActiveCart(customer_id);

    for (const item of items) {
      const { product_id, quantity } = item;
      if (product_id && quantity && quantity > 0) {
        await mergeCartItem(cartId, product_id, quantity);
      }
    }

    res.status(200).json({ message: "Cart merged successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error merging cart");
  }
};

// DELETE /cart/:productId
const removeFromCart = async (req: Request, res: Response): Promise<void> => {
  const customer_id = req.user?.customer_id;
  if (!customer_id) {
    res.status(401).json({ message: "Unauthorized" });
  }

  const { product_id } = req.body;

  if (isNaN(product_id)) {
    res.status(400).json({ message: "Invalid product ID" });
  }

  try {
    const removed = await removeItemFromCart(customer_id!, product_id);
    if (removed) {
      res.status(200).json({ message: "Item removed from cart" });
    } else {
      res.status(404).json({ message: "Item not found in cart" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Error removing item from cart");
  }
};

// DELETE clear cart
const clearCart = async (req: Request, res: Response): Promise<void> => {
  const customer_id = req.user?.customer_id;
  if (!customer_id) {
    res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const removed = await clearItemsInCart(customer_id!);
    if (removed) {
      res.status(200).json({ message: "Items cleared from cart" });
    } else {
      res.status(200).json({ message: "No Items in cart to clear" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Error clearing items from cart");
  }
};

export default {
  getCart,
  updateCart,
  mergeCart,
  removeFromCart,
  clearCart,
};
