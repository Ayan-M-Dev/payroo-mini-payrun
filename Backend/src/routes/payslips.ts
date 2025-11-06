import { Router } from "express";
import * as payrunService from "../services/payrunService";
import { transformPayslip } from "../lib/transformers";
import { asyncHandler, AppError } from "../lib/errorHandler";

const router = Router();

router.get(
  "/:employeeId/:payrunId",
  asyncHandler(async (req, res) => {
    const payslip = await payrunService.getPayslip(
      req.params.employeeId,
      req.params.payrunId
    );

    if (!payslip) {
      throw new AppError(404, "Payslip not found");
    }

    res.json(transformPayslip(payslip));
  })
);

export default router;
