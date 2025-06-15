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
exports.refreshToken = exports.getMe = exports.logout = exports.login = exports.register = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
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
exports.default = {
    register: exports.register,
    login: exports.login,
    getMe: exports.getMe,
    logout: exports.logout,
    refreshToken: exports.refreshToken,
};
//# sourceMappingURL=authController.js.map