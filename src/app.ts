import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import session from "express-session";
import Redis from "ioredis";
import { RedisStore } from "connect-redis";

export const app = express();
const PORT = parseInt(process.env.PORT || "3000", 10);
app.set("trust proxy", 1);

// Redis setup
const redisClient = new Redis({
  host: process.env.REDIS_HOST,
  port: 6379,
  tls: {
    rejectUnauthorized: false,
    servername: process.env.REDIS_SERVER,
  },
});

const store = new RedisStore({
  client: redisClient,
  prefix: "sess:",
  ttl: 60 * 10,
});

// Session config
app.use(
  session({
    store,
    name: "sid",
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 1000 * 60 * 30,
    },
  }),
);

// CORS
app.use(
  cors({
    origin: (origin, callback) => {
      if (process.env.NODE_ENV !== "production") {
        // Allow everything in dev
        return callback(null, true);
      }

      const allowedOrigins = [
        "https://www.gmpetitcafe.com",
        "https://gmpetitcafe.com",
      ];

      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);

// Debug
app.use((req, res, next) => {
  console.log("Incoming cookies:", req.headers.cookie);
  console.log("Session at entry:", req.session);
  next();
});

app.use(express.json());
app.use(cookieParser());

// Routes
import authRoutes from "./v1/routes/authRoutes";
import orderRoutes from "./v1/routes/orderRoutes";
import cartRoutes from "./v1/routes/cartRoutes";
import notificationRoutes from "./v1/routes/notificationRoutes";
import productRoutes from "./v1/routes/productRoutes";
import healthRoutes from "./v1/routes/healthRoutes";
import billingRoutes from "./v1/routes/billingRoutes";

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/orders", orderRoutes);
app.use("/api/v1/cart", cartRoutes);
app.use("/api/v1/notification", notificationRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/health", healthRoutes);
app.use("/api/v1/billing", billingRoutes);

// Redis start
redisClient.on("connect", () => console.log("🔌 Redis client connected."));
redisClient.on("ready", () => console.log("✅ Redis client ready to use."));
redisClient.on("error", (err) => console.error("❌ Redis error:", err));

redisClient
  .ping()
  .then((res) => {
    console.log("Redis PING response:", res);
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Redis PING failed. Server not started.", err);
  });
