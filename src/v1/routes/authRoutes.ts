import express from "express";
import rateLimit from "express-rate-limit";
import authController from "../../controllers/authController";
import { authenticate } from "../../middleware/authMiddleware";

const router = express.Router();

// Brute-force protection on credential endpoints.
// Keyed on IP; counts failed AND successful attempts so an attacker can't
// piggyback on a known-good account to mask spray attempts.
const credentialLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many attempts, please try again later." },
});

// Email-enumeration / reset-token-spray protection.
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests, please try again later." },
});

router.post("/register", credentialLimiter, authController.register);
router.post("/login", credentialLimiter, authController.login);
router.get("/me", authenticate, authController.getMe);
router.post("/logout", authController.logout);
router.get("/refresh-token", authController.refreshToken);
router.post(
  "/forgot-password",
  passwordResetLimiter,
  authController.forgotPassword,
);
router.post(
  "/reset-password",
  passwordResetLimiter,
  authController.resetPassword,
);

export default router;
