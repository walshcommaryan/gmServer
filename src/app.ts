import dotenv from 'dotenv';
dotenv.config(); // ✅ Load environment variables from .env file

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './v1/routes/authRoutes';
import orderRoutes from './v1/routes/orderRoutes';

const app = express();
const PORT = parseInt(process.env.PORT || '2000', 10);

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/orders', orderRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});