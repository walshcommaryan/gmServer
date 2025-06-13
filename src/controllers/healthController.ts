import { Request, Response } from "express";
import healthService from "../services/healthService";

const healthCheck = async (req: Request, res: Response): Promise<void> => {
  try {
    await healthService.testDbConnection();
    res.status(200).json({
      status: "OK",
      db: "connected",
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Health check DB connection error:", error);
    res
      .status(500)
      .json({ status: "ERROR", db: "disconnected", error: error.message });
  }
};

export default { healthCheck };
