import {
  TimesheetEntryInput,
  PayCalculation,
  EmployeeData,
} from "../types/payroll";
import { calculateHours } from "./hours";
import { calculateGrossPay } from "./grossPay";
import { calculateTax } from "./tax";
import { calculateSuper } from "./super";
import { calculateNetPay } from "./netPay";

export function calculatePayroll(
  entries: TimesheetEntryInput[],
  allowances: number,
  employee: EmployeeData
): PayCalculation {
  const hours = calculateHours(entries);
  const gross = calculateGrossPay(hours, employee.baseHourlyRate, allowances);
  const tax = calculateTax(gross);
  const superAmount = calculateSuper(gross, employee.superRate);
  const net = calculateNetPay(gross, tax);

  return {
    normalHours: hours.normalHours,
    overtimeHours: hours.overtimeHours,
    gross,
    tax,
    super: superAmount,
    net,
  };
}
