import express from "express";
import authController from "../../controllers/authController";
import { authenticate } from "../../middleware/authMiddleware";

const router = express.Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/me", authenticate, authController.getMe);
router.post("/logout", authController.logout);
router.get("/refresh-token", authController.refreshToken); // Optional

export default router;
