import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import orderRoutes from './v1/routes/orderRoutes';
import authRoutes from './v1/routes/authRoutes';

const app = express();

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/auth', authRoutes);

const PORT = process.env.PORT || 2000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));