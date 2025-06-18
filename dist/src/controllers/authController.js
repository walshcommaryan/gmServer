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
exports.resetPassword = exports.forgotPassword = exports.refreshToken = exports.getMe = exports.logout = exports.login = exports.register = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const database_1 = __importDefault(require("../database/database"));
const notificationService_1 = __importDefault(require("../services/notificationService"));
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { first_name, last_name, email, password, phone } = req.body;
    try {
        const hashed = yield bcrypt_1.default.hash(password, 10);
        const phoneIfNull = phone ? phone : null;
        // Save the user to the database
        const [result] = yield database_1.default.query("INSERT INTO customers (first_name, last_name, email, phone, password, created_at) VALUES (?, ?, ?, ?, ?, NOW())", [first_name, last_name, email, phoneIfNull, hashed]);
        const newCustomerId = result.insertId;
        // Send notification to business owner
        yield notificationService_1.default.sendNewUserRegistrationEmail({
            first_name,
            last_name,
            email,
            phone,
        });
        const accessToken = jsonwebtoken_1.default.sign({ customer_id: newCustomerId }, process.env.JWT_SECRET, { expiresIn: "15m" });
        const refreshToken = jsonwebtoken_1.default.sign({ customer_id: newCustomerId }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" });
        res
            .cookie("token", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        })
            .cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        })
            .status(201)
            .send({ message: "Logged in" });
    }
    catch (err) {
        console.error(err);
        res.status(500).send("Error registering user");
    }
});
exports.register = register;
const login = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        const [customers] = yield database_1.default.query("SELECT * FROM customers WHERE email = ?", [email]);
        const customer = customers[0];
        if (!customer) {
            res.status(401).send("User not found");
            return;
        }
        const isValid = yield bcrypt_1.default.compare(password, customer.password);
        if (!isValid) {
            res.status(401).send("Invalid credentials");
            return;
        }
        const accessToken = jsonwebtoken_1.default.sign({ customer_id: customer.customer_id }, process.env.JWT_SECRET, { expiresIn: "15m" });
        const refreshToken = jsonwebtoken_1.default.sign({ customer_id: customer.customer_id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" });
        res
            .cookie("token", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        })
            .cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        })
            .status(201)
            .send({ message: "Logged in" });
    }
    catch (err) {
        console.error(err);
        next(err);
    }
});
exports.login = login;
const logout = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        });
        res.send({ message: "Logged out" });
    }
    catch (err) {
        console.error(err);
        next(err);
    }
});
exports.logout = logout;
const getMe = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const customer_id = (_a = req.user) === null || _a === void 0 ? void 0 : _a.customer_id;
        if (!customer_id) {
            res.sendStatus(401);
            return;
        }
        const [customers] = yield database_1.default.query("SELECT customer_id, first_name, last_name, email, phone, created_at FROM customers WHERE customer_id = ?", [customer_id]);
        res.send(customers[0]);
    }
    catch (err) {
        console.error(err);
        next(err);
    }
});
exports.getMe = getMe;
const refreshToken = (req, res) => {
    const token = req.cookies.refreshToken;
    if (!token) {
        res.status(401).send("No refresh token");
        return;
    }
    try {
        const payload = jsonwebtoken_1.default.verify(token, process.env.REFRESH_TOKEN_SECRET);
        const newAccessToken = jsonwebtoken_1.default.sign({ customer_id: payload.customer_id }, process.env.JWT_SECRET, { expiresIn: "15m" });
        res.cookie("token", newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        });
        res.json({ message: "Token refreshed" });
    }
    catch (err) {
        console.error("Refresh failed", err);
        res.status(403).send("Invalid refresh token");
    }
};
exports.refreshToken = refreshToken;
const forgotPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    if (!email) {
        res.status(400).json({ message: "Email required" });
        return;
    }
    try {
        const [users] = yield database_1.default.query("SELECT * FROM customers WHERE email = ?", [email]);
        const user = users[0];
        if (!user) {
            res.status(200).json({ message: "If that email exists, a reset link has been sent." });
            return;
        }
        const token = crypto_1.default.randomBytes(32).toString("hex");
        const expires = new Date(Date.now() + 1000 * 60 * 60).toISOString().slice(0, 19).replace('T', ' ');
        yield database_1.default.query("UPDATE customers SET reset_password_token = ?, reset_password_expires = ? WHERE customer_id = ?", [token, expires, user.customer_id]);
        const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;
        yield notificationService_1.default.sendPasswordResetEmail({
            name: `${user.first_name} ${user.last_name}`,
            email,
            resetUrl,
        });
        res.status(200).json({ message: "If that email exists, a reset link has been sent." });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});
exports.forgotPassword = forgotPassword;
const resetPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, token, newPassword, password } = req.body;
    const finalPassword = newPassword || password;
    if (!email || !token || !finalPassword) {
        res.status(400).json({ message: "Missing fields" });
        return;
    }
    try {
        const [users] = yield database_1.default.query("SELECT * FROM customers WHERE email = ? AND reset_password_token = ? AND reset_password_expires > NOW()", [email, token]);
        const user = users[0];
        if (!user) {
            res.status(400).json({ message: "Invalid or expired token" });
            return;
        }
        const hashed = yield bcrypt_1.default.hash(finalPassword, 10);
        yield database_1.default.query("UPDATE customers SET password = ?, reset_password_token = NULL, reset_password_expires = NULL WHERE customer_id = ?", [hashed, user.customer_id]);
        res.status(200).json({ message: "Password reset successful" });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});
exports.resetPassword = resetPassword;
exports.default = {
    register: exports.register,
    login: exports.login,
    getMe: exports.getMe,
    logout: exports.logout,
    refreshToken: exports.refreshToken,
    forgotPassword: exports.forgotPassword,
    resetPassword: exports.resetPassword,
};
//# sourceMappingURL=authController.js.map