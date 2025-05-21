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
const healthService_1 = __importDefault(require("../services/healthService"));
const healthCheck = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield healthService_1.default.testDbConnection();
        res.status(200).json({ status: 'OK', db: 'connected', timestamp: new Date().toISOString() });
    }
    catch (error) {
        console.error('Health check DB connection error:', error);
        res.status(500).json({ status: 'ERROR', db: 'disconnected', error: error.message });
    }
});
exports.default = { healthCheck };
