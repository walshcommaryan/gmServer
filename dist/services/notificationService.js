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
const database_1 = __importDefault(require("../database/database"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const saveContactSubmission = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, phone, subject, message } = data;
    yield database_1.default.query('INSERT INTO contact_submissions (email, phone, subject, message) VALUES (?, ?, ?, ?)', [email, phone || '', subject, message]);
});
const sendEmail = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const transporter = nodemailer_1.default.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS,
        },
    });
    yield transporter.sendMail({
        from: `"Contact Form" <${process.env.MAIL_USER}>`,
        to: data.email,
        subject: `New Contact Form Submission: ${data.subject}`,
        text: `
        From: ${data.email}
        Phone: ${data.phone || 'N/A'}
        Message:
        ${data.message}
    `,
    });
});
exports.default = {
    saveContactSubmission,
    sendEmail,
};
