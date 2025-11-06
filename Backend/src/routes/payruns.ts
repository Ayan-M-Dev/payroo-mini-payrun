import { Router } from "express";
import { validateBody, payrunRequestSchema } from "../lib/schemas";
import * as payrunService from "../services/payrunService";
import { transformPayrun } from "../lib/transformers";
import { asyncHandler, AppError } from "../lib/errorHandler";

const router = Router();

router.post(
  "/",
  validateBody(payrunRequestSchema),
  asyncHandler(async (req, res) => {
    try {
      const payrun = await payrunService.generatePayrun(req.body);
      res.status(201).json(transformPayrun(payrun));
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes("No timesheets found")
      ) {
        throw new AppError(404, error.message);
      }
      throw error;
    }
  })
);

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const payruns = await payrunService.getAllPayruns();
    res.json(payruns.map(transformPayrun));
  })
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const payrun = await payrunService.getPayrunById(req.params.id);

    if (!payrun) {
      throw new AppError(404, "Payrun not found");
    }

    res.json(transformPayrun(payrun));
  })
);

export default router;
