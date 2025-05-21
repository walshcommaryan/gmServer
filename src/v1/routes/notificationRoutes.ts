import express from 'express';
import rateLimit from 'express-rate-limit';
import notificationController from '../../controllers/notificationController';

const router = express.Router();

const contactFormLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  message: "Too many submissions, please try again later.",
});

router.post('/email', contactFormLimiter, notificationController.sendEmail);

export default router;