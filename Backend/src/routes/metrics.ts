import { Router } from "express";
import { asyncHandler } from "../lib/errorHandler";

const router = Router();

router.get(
  "/metrics",
  asyncHandler(async (req, res) => {
    const metrics = {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: {
        heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        rss: Math.round(process.memoryUsage().rss / 1024 / 1024),
      },
      nodeVersion: process.version,
    };

    res.json(metrics);
  })
);

export default router;
