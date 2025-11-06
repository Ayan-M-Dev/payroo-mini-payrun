import { Employee, Timesheet, Payrun, Payslip } from "@prisma/client";

export function transformEmployee(employee: Employee) {
  return {
    id: employee.id,
    firstName: employee.firstName,
    lastName: employee.lastName,
    type: employee.type,
    baseHourlyRate: employee.baseHourlyRate,
    superRate: employee.superRate,
    bank: {
      bsb: employee.bankBsb,
      account: employee.bankAccount,
    },
  };
}

export function transformTimesheet(
  timesheet: Timesheet & {
    entries: Array<{
      date: Date;
      start: string;
      end: string;
      unpaidBreakMins: number;
    }>;
  }
) {
  return {
    employeeId: timesheet.employeeId,
    periodStart: timesheet.periodStart.toISOString().split("T")[0],
    periodEnd: timesheet.periodEnd.toISOString().split("T")[0],
    entries: timesheet.entries.map((entry) => ({
      date: entry.date.toISOString().split("T")[0],
      start: entry.start,
      end: entry.end,
      unpaidBreakMins: entry.unpaidBreakMins,
    })),
    allowances: timesheet.allowances,
  };
}

export function transformPayslip(payslip: Payslip) {
  return {
    employeeId: payslip.employeeId,
    normalHours: payslip.normalHours,
    overtimeHours: payslip.overtimeHours,
    gross: payslip.gross,
    tax: payslip.tax,
    super: payslip.super,
    net: payslip.net,
  };
}

export function transformPayrun(
  payrun: Payrun & {
    payslips: Array<Payslip>;
  }
) {
  return {
    id: payrun.id,
    periodStart: payrun.periodStart.toISOString().split("T")[0],
    periodEnd: payrun.periodEnd.toISOString().split("T")[0],
    totals: {
      gross: payrun.totalGross,
      tax: payrun.totalTax,
      super: payrun.totalSuper,
      net: payrun.totalNet,
    },
    payslips: payrun.payslips.map(transformPayslip),
  };
}
