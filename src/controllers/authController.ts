// ✅ FILE: /server/controllers/authController.ts
import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from '../database/database';

const register = async (req: Request, res: Response) => {
  const { first_name, last_name, email, phone, password } = req.body;
  try {
    const hashed = await bcrypt.hash(password, 10);
    await db.query(
      'INSERT INTO customers (first_name, last_name, email, phone, password, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
      [first_name, last_name, email, phone, hashed]
    );
    res.sendStatus(201);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error registering user');
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { email, password } = req.body;
  try {
    const [customers]: any = await db.query(
      'SELECT * FROM customers WHERE email = ?',
      [email]
    );
    const customer = customers[0];
    if (!customer) {
      res.status(401).send('User not found');
      return;
    }

    const isValid = await bcrypt.compare(password, customer.password);
    if (!isValid) {
      res.status(401).send('Invalid credentials');
      return;
    }

    const token = jwt.sign(
      { customer_id: customer.customer_id },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    res.send({ message: 'Logged in' });
  } catch (err) {
    console.error(err);
    next(err); // Pass errors to Express error handler
  }
};

export const getMe = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const customer_id = req.user?.customer_id;
    if (!customer_id) {
      res.sendStatus(401);
      return;
    }
    const [customers]: any = await db.query(
      'SELECT customer_id, first_name, last_name, email, phone, created_at FROM customers WHERE customer_id = ?',
      [customer_id]
    );
    res.send(customers[0]);
  } catch (err) {
    console.error(err);
    next(err);
  }
};

export default {
  register,
  login,
  getMe,
};