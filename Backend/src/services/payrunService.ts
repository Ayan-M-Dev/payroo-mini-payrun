import prisma from "../lib/db";
import { PayrunRequestInput } from "../lib/validation";
import { calculatePayroll } from "../domain/payroll";
import { TimesheetEntryInput } from "../types/payroll";

export async function generatePayrun(data: PayrunRequestInput) {
  const periodStart = new Date(data.periodStart);
  const periodEnd = new Date(data.periodEnd);

  const timesheets = await prisma.timesheet.findMany({
    where: {
      periodStart: {
        lte: periodEnd,
      },
      periodEnd: {
        gte: periodStart,
      },
      ...(data.employeeIds && data.employeeIds.length > 0
        ? {
            employeeId: {
              in: data.employeeIds,
            },
          }
        : {}),
    },
    include: {
      employee: true,
      entries: {
        orderBy: {
          date: "asc",
        },
      },
    },
  });

  if (timesheets.length === 0) {
    throw new Error("No timesheets found for the specified period");
  }

  const payslipData = [];
  let totalGross = 0;
  let totalTax = 0;
  let totalSuper = 0;
  let totalNet = 0;

  for (const timesheet of timesheets) {
    const entries: TimesheetEntryInput[] = timesheet.entries.map((entry) => ({
      date: entry.date.toISOString().split("T")[0],
      start: entry.start,
      end: entry.end,
      unpaidBreakMins: entry.unpaidBreakMins,
    }));

    const calculation = calculatePayroll(entries, timesheet.allowances, {
      baseHourlyRate: timesheet.employee.baseHourlyRate,
      superRate: timesheet.employee.superRate,
    });

    totalGross += calculation.gross;
    totalTax += calculation.tax;
    totalSuper += calculation.super;
    totalNet += calculation.net;

    payslipData.push({
      employeeId: timesheet.employeeId,
      normalHours: calculation.normalHours,
      overtimeHours: calculation.overtimeHours,
      gross: calculation.gross,
      tax: calculation.tax,
      super: calculation.super,
      net: calculation.net,
    });
  }

  const payrun = await prisma.payrun.create({
    data: {
      periodStart,
      periodEnd,
      totalGross,
      totalTax,
      totalSuper,
      totalNet,
      payslips: {
        create: payslipData,
      },
    },
    include: {
      payslips: {
        include: {
          employee: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      },
    },
  });

  return payrun;
}

export async function getAllPayruns() {
  return prisma.payrun.findMany({
    include: {
      payslips: {
        include: {
          employee: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getPayrunById(id: string) {
  return prisma.payrun.findUnique({
    where: { id },
    include: {
      payslips: {
        include: {
          employee: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      },
    },
  });
}

export async function getPayslip(employeeId: string, payrunId: string) {
  return prisma.payslip.findUnique({
    where: {
      payrunId_employeeId: {
        payrunId,
        employeeId,
      },
    },
    include: {
      employee: true,
      payrun: true,
    },
  });
}
