import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import authRoutes from './v1/routes/authRoutes';
import orderRoutes from './v1/routes/orderRoutes';
import cartRoutes from './v1/routes/cartRoutes';
import notificationRoutes from './v1/routes/notificationRoutes';
import productRoutes from './v1/routes/productRoutes';
import healthRoutes from './v1/routes/healthRoutes';

const app = express();
const PORT = parseInt(process.env.PORT || '2000', 10);

const allowedOrigins = [
  'http://localhost:3000',         
  'https://gmpetitcafe.com',      
  'https://www.gmpetitcafe.com',
];

app.use((req, res, next) => {
  console.log('Origin:', req.headers.origin);
  next();
});

app.use(cors({
  origin: (origin, callback) => {
    // Debug log to see origin on requests
    console.log('CORS origin:', origin);

    // Allow requests with no origin (like Postman or server-to-server)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      // Allowed origin
      callback(null, true);
    } else {
      // Not allowed
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));


app.use(express.json());
app.use(cookieParser());

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/cart', cartRoutes);
app.use('/api/v1/notification', notificationRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/health', healthRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
