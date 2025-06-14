import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface JwtPayload {
  customer_id: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const token = req.cookies.token;
  if (!token) {
    res.status(401).json({ message: "No token provided" });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    req.user = decoded;
    return next();
  } catch (err: any) {
    console.error("JWT error:", err);

    if (err.name === "TokenExpiredError") {
      console.warn("Token expired");
      res.status(401).json({ message: "Token expired" });
      return;
    }

    res.status(403).json({ message: "Invalid token" });
    return;
  }
};
