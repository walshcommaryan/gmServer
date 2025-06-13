import { Request, Response } from "express";
import { getAllProducts } from "../services/productService";

export const getProducts = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  try {
    const products = await getAllProducts();
    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
