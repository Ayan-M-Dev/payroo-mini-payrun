import { Router } from "express";
import { validateBody, timesheetSchema } from "../lib/schemas";
import * as timesheetService from "../services/timesheetService";
import { transformTimesheet } from "../lib/transformers";
import { asyncHandler, AppError } from "../lib/errorHandler";

const router = Router();

router.post(
  "/",
  validateBody(timesheetSchema),
  asyncHandler(async (req, res) => {
    try {
      const timesheet = await timesheetService.upsertTimesheet(req.body);
      res.status(201).json(transformTimesheet(timesheet));
    } catch (error) {
      if (error instanceof Error && error.message.includes("not found")) {
        throw new AppError(404, error.message);
      }
      throw error;
    }
  })
);

export default router;
