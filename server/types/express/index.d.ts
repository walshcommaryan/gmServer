import { JwtPayload } from 'jsonwebtoken';
import 'express-session';

declare module 'express-session' {
  interface SessionData {
    paymentConfirmed?: boolean;
    customer_id?: number;
  }
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        customer_id: number;
      };
    }
  }
}
