"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const notificationService_1 = __importDefault(require("../services/notificationService"));
const sendEmail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, phone, subject, message } = req.body;
        if (!email || !subject || !message) {
            res.status(400).json({ message: 'Required fields missing' });
            return;
        }
        yield notificationService_1.default.saveContactSubmission({ email, phone, subject, message });
        yield notificationService_1.default.sendEmail({ email, phone, subject, message });
        res.status(200).json({ message: 'Message sent successfully' });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error sending contact form' });
    }
});
exports.default = {
    sendEmail,
};
