"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const authRoutes_1 = __importDefault(require("./v1/routes/authRoutes"));
const orderRoutes_1 = __importDefault(require("./v1/routes/orderRoutes"));
const cartRoutes_1 = __importDefault(require("./v1/routes/cartRoutes"));
const notificationRoutes_1 = __importDefault(require("./v1/routes/notificationRoutes"));
const productRoutes_1 = __importDefault(require("./v1/routes/productRoutes"));
const healthRoutes_1 = __importDefault(require("./v1/routes/healthRoutes"));
const billingRoutes_1 = __importDefault(require("./v1/routes/billingRoutes"));
const app = (0, express_1.default)();
const PORT = parseInt(process.env.PORT || '2000', 10);
const allowedOrigins = [
    'http://localhost:3000',
    'https://gmpetitcafe.com',
    'https://www.gmpetitcafe.com',
];
app.use((req, res, next) => {
    // FOR DEBUGGING ORIGIN
    // console.log('Origin:', req.headers.origin);
    // console.log(`Incoming request: ${req.method} ${req.originalUrl}`);
    next();
});
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // Allow requests with no origin
        if (!origin)
            return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            // Allowed origin
            callback(null, true);
        }
        else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
}));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use('/api/v1/auth', authRoutes_1.default);
app.use('/api/v1/orders', orderRoutes_1.default);
app.use('/api/v1/cart', cartRoutes_1.default);
app.use('/api/v1/notification', notificationRoutes_1.default);
app.use('/api/v1/products', productRoutes_1.default);
app.use('/api/v1/health', healthRoutes_1.default);
app.use('/api/v1/billing', billingRoutes_1.default);
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
