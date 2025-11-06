import prisma from "../lib/db";
import { TimesheetInput } from "../lib/validation";

export async function getTimesheetByEmployeeAndPeriod(
  employeeId: string,
  periodStart: Date,
  periodEnd: Date
) {
  return prisma.timesheet.findFirst({
    where: {
      employeeId,
      periodStart,
      periodEnd,
    },
    include: {
      entries: {
        orderBy: {
          date: "asc",
        },
      },
    },
  });
}

export async function upsertTimesheet(data: TimesheetInput) {
  const periodStart = new Date(data.periodStart);
  const periodEnd = new Date(data.periodEnd);

  const employee = await prisma.employee.findUnique({
    where: { id: data.employeeId },
  });

  if (!employee) {
    throw new Error(`Employee with ID ${data.employeeId} not found`);
  }

  const existing = await prisma.timesheet.findFirst({
    where: {
      employeeId: data.employeeId,
      periodStart,
      periodEnd,
    },
  });

  if (existing) {
    await prisma.timesheet.delete({
      where: { id: existing.id },
    });
  }

  return prisma.timesheet.create({
    data: {
      employeeId: data.employeeId,
      periodStart,
      periodEnd,
      allowances: data.allowances,
      entries: {
        create: data.entries.map((entry) => ({
          date: new Date(entry.date),
          start: entry.start,
          end: entry.end,
          unpaidBreakMins: entry.unpaidBreakMins,
        })),
      },
    },
    include: {
      entries: {
        orderBy: {
          date: "asc",
        },
      },
    },
  });
}

export async function getTimesheetsByEmployee(employeeId: string) {
  return prisma.timesheet.findMany({
    where: { employeeId },
    include: {
      entries: {
        orderBy: {
          date: "asc",
        },
      },
    },
    orderBy: {
      periodStart: "desc",
    },
  });
}

export async function getTimesheetsByPeriod(
  periodStart: Date,
  periodEnd: Date
) {
  return prisma.timesheet.findMany({
    where: {
      periodStart: {
        gte: periodStart,
      },
      periodEnd: {
        lte: periodEnd,
      },
    },
    include: {
      employee: true,
      entries: {
        orderBy: {
          date: "asc",
        },
      },
    },
    orderBy: {
      periodStart: "desc",
    },
  });
}
