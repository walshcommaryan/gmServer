"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const healthController_1 = __importDefault(require("../../controllers/healthController"));
const router = express_1.default.Router();
// Health Check
router.get("/", healthController_1.default.healthCheck);
exports.default = router;
