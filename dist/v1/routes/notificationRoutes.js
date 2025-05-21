"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const notificationController_1 = __importDefault(require("../../controllers/notificationController"));
const router = express_1.default.Router();
const contactFormLimiter = (0, express_rate_limit_1.default)({
    windowMs: 10 * 60 * 1000,
    max: 5,
    message: "Too many submissions, please try again later.",
});
router.post('/email', contactFormLimiter, notificationController_1.default.sendEmail);
exports.default = router;
