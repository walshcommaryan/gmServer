import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import jwt, { JwtPayload } from "jsonwebtoken";
import crypto from "crypto";
import db from "../database/database";
import notificationService from "../services/notificationService";

export const register = async (req: Request, res: Response) => {
  const { first_name, last_name, email, password, phone } = req.body;

  try {
    const hashed = await bcrypt.hash(password, 10);
    const phoneIfNull = phone ? phone : null;

    // Save the user to the database
    const [result]: any = await db.query(
      "INSERT INTO customers (first_name, last_name, email, phone, password, created_at) VALUES (?, ?, ?, ?, ?, NOW())",
      [first_name, last_name, email, phoneIfNull, hashed],
    );

    const newCustomerId = result.insertId;

    // Send notification to business owner
    await notificationService.sendNewUserRegistrationEmail({
      first_name,
      last_name,
      email,
      phone,
    });

    const accessToken = jwt.sign(
      { customer_id: newCustomerId },
      process.env.JWT_SECRET!,
      { expiresIn: "15m" },
    );

    const refreshToken = jwt.sign(
      { customer_id: newCustomerId },
      process.env.REFRESH_TOKEN_SECRET!,
      { expiresIn: "7d" },
    );

    res
      .cookie("token", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      })
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      })
      .status(201)
      .send({ message: "Logged in" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error registering user");
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const { email, password } = req.body;
  try {
    const [customers]: any = await db.query(
      "SELECT * FROM customers WHERE email = ?",
      [email],
    );
    const customer = customers[0];
    if (!customer) {
      res.status(401).send("User not found");
      return;
    }

    const isValid = await bcrypt.compare(password, customer.password);
    if (!isValid) {
      res.status(401).send("Invalid credentials");
      return;
    }

    const accessToken = jwt.sign(
      { customer_id: customer.customer_id },
      process.env.JWT_SECRET!,
      { expiresIn: "15m" },
    );

    const refreshToken = jwt.sign(
      { customer_id: customer.customer_id },
      process.env.REFRESH_TOKEN_SECRET!,
      { expiresIn: "7d" },
    );

    res
      .cookie("token", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      })
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      })
      .status(201)
      .send({ message: "Logged in" });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });
    res.send({ message: "Logged out" });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

export const getMe = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const customer_id = req.user?.customer_id;
    if (!customer_id) {
      res.sendStatus(401);
      return;
    }
    const [customers]: any = await db.query(
      "SELECT customer_id, first_name, last_name, email, phone, created_at FROM customers WHERE customer_id = ?",
      [customer_id],
    );
    res.send(customers[0]);
  } catch (err) {
    console.error(err);
    next(err);
  }
};

export const refreshToken = (req: Request, res: Response): void => {
  const token = req.cookies.refreshToken;
  if (!token) {
    res.status(401).send("No refresh token");
    return;
  }

  try {
    const payload = jwt.verify(
      token,
      process.env.REFRESH_TOKEN_SECRET!,
    ) as JwtPayload;

    const newAccessToken = jwt.sign(
      { customer_id: payload.customer_id },
      process.env.JWT_SECRET!,
      { expiresIn: "15m" },
    );

    res.cookie("token", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });

    res.json({ message: "Token refreshed" });
  } catch (err) {
    console.error("Refresh failed", err);
    res.status(403).send("Invalid refresh token");
  }
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;
  if (!email) {
    res.status(400).json({ message: "Email required" });
    return;
  }

  try {
    const [users]: any = await db.query("SELECT * FROM customers WHERE email = ?", [email]);
    const user = users[0];
    if (!user) {
      res.status(200).json({ message: "If that email exists, a reset link has been sent." });
      return;
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 1000 * 60 * 60).toISOString().slice(0, 19).replace('T', ' ');

    await db.query(
      "UPDATE customers SET reset_password_token = ?, reset_password_expires = ? WHERE customer_id = ?",
      [token, expires, user.customer_id]
    );

    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;
    await notificationService.sendPasswordResetEmail({
      name: `${user.first_name} ${user.last_name}`,
      email,
      resetUrl,
    });

    res.status(200).json({ message: "If that email exists, a reset link has been sent." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  const { email, token, newPassword, password } = req.body;
  const finalPassword = newPassword || password;
  if (!email || !token || !finalPassword) {
    res.status(400).json({ message: "Missing fields" });
    return;
  }

  try {
    const [users]: any = await db.query(
      "SELECT * FROM customers WHERE email = ? AND reset_password_token = ? AND reset_password_expires > NOW()",
      [email, token]
    );
    const user = users[0];
    if (!user) {
      res.status(400).json({ message: "Invalid or expired token" });
      return;
    }

    const hashed = await bcrypt.hash(finalPassword, 10);
    await db.query(
      "UPDATE customers SET password = ?, reset_password_token = NULL, reset_password_expires = NULL WHERE customer_id = ?",
      [hashed, user.customer_id]
    );

    res.status(200).json({ message: "Password reset successful" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export default {
  register,
  login,
  getMe,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword,
};
