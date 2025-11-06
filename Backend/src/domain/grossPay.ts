import { HoursBreakdown } from "../types/payroll";

export function calculateGrossPay(
  hours: HoursBreakdown,
  baseHourlyRate: number,
  allowances: number
): number {
  const normalPay = hours.normalHours * baseHourlyRate;
  const overtimePay = hours.overtimeHours * baseHourlyRate * 1.5;
  const gross = normalPay + overtimePay + allowances;

  return Math.round(gross * 100) / 100;
}
