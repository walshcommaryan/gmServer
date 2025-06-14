"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const express_session_1 = __importDefault(require("express-session"));
const ioredis_1 = __importDefault(require("ioredis"));
const connect_redis_1 = require("connect-redis");
exports.app = (0, express_1.default)();
const PORT = parseInt(process.env.PORT || "3000", 10);
exports.app.set("trust proxy", 1);
// Redis setup
const redisClient = new ioredis_1.default({
    host: process.env.REDIS_HOST,
    port: 6379,
    tls: {
        rejectUnauthorized: false,
        servername: process.env.REDIS_SERVER,
    },
});
const store = new connect_redis_1.RedisStore({
    client: redisClient,
    prefix: "sess:",
});
// Session config
exports.app.use((0, express_session_1.default)({
    store,
    name: "sid",
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: 1000 * 60 * 30,
    },
}));
// CORS
exports.app.use((0, cors_1.default)({
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
        }
        else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
}));
// Debug
exports.app.use((req, res, next) => {
    console.log("Incoming cookies:", req.headers.cookie);
    console.log("Session at entry:", req.session);
    next();
});
exports.app.use(express_1.default.json());
exports.app.use((0, cookie_parser_1.default)());
// Routes
const authRoutes_1 = __importDefault(require("./v1/routes/authRoutes"));
const orderRoutes_1 = __importDefault(require("./v1/routes/orderRoutes"));
const cartRoutes_1 = __importDefault(require("./v1/routes/cartRoutes"));
const notificationRoutes_1 = __importDefault(require("./v1/routes/notificationRoutes"));
const productRoutes_1 = __importDefault(require("./v1/routes/productRoutes"));
const healthRoutes_1 = __importDefault(require("./v1/routes/healthRoutes"));
const billingRoutes_1 = __importDefault(require("./v1/routes/billingRoutes"));
exports.app.use("/api/v1/auth", authRoutes_1.default);
exports.app.use("/api/v1/orders", orderRoutes_1.default);
exports.app.use("/api/v1/cart", cartRoutes_1.default);
exports.app.use("/api/v1/notification", notificationRoutes_1.default);
exports.app.use("/api/v1/products", productRoutes_1.default);
exports.app.use("/api/v1/health", healthRoutes_1.default);
exports.app.use("/api/v1/billing", billingRoutes_1.default);
// Redis start
redisClient.on("connect", () => console.log("🔌 Redis client connected."));
redisClient.on("ready", () => console.log("✅ Redis client ready to use."));
redisClient.on("error", (err) => console.error("❌ Redis error:", err));
redisClient
    .ping()
    .then((res) => {
    console.log("Redis PING response:", res);
    exports.app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
    });
})
    .catch((err) => {
    console.error("❌ Redis PING failed. Server not started.", err);
});
//# sourceMappingURL=app.js.map