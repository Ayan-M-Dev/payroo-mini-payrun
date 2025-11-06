import { Router } from "express";
import { validateBody, employeeSchema } from "../lib/schemas";
import * as employeeService from "../services/employeeService";
import { transformEmployee } from "../lib/transformers";
import { asyncHandler, AppError } from "../lib/errorHandler";

const router = Router();

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const employees = await employeeService.getAllEmployees();
    res.json(employees.map(transformEmployee));
  })
);

router.post(
  "/",
  validateBody(employeeSchema),
  asyncHandler(async (req, res) => {
    const employee = await employeeService.upsertEmployee(req.body);
    res.status(201).json(transformEmployee(employee));
  })
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const employee = await employeeService.getEmployeeById(req.params.id);

    if (!employee) {
      throw new AppError(404, "Employee not found");
    }

    res.json(transformEmployee(employee));
  })
);

export default router;
