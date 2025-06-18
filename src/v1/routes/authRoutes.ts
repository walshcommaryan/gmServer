import express from "express";
import authController from "../../controllers/authController";
import { authenticate } from "../../middleware/authMiddleware";

const router = express.Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/me", authenticate, authController.getMe);
router.post("/logout", authController.logout);
router.get("/refresh-token", authController.refreshToken);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);

export default router;
