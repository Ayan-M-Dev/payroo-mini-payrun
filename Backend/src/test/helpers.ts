import prisma from "../lib/db";

const TEST_TOKEN = "test-token-123";

export function getAuthHeader() {
  return { Authorization: `Bearer ${TEST_TOKEN}` };
}

export async function cleanupDatabase() {
  try {
    await prisma.payslip.deleteMany();
  } catch {
    // Table might not exist yet
  }
  try {
    await prisma.payrun.deleteMany();
  } catch {
    // Table might not exist yet
  }
  try {
    await prisma.timesheetEntry.deleteMany();
  } catch {
    // Table might not exist yet
  }
  try {
    await prisma.timesheet.deleteMany();
  } catch {
    // Table might not exist yet
  }
  try {
    await prisma.employee.deleteMany();
  } catch {
    // Table might not exist yet
  }
}

export async function createTestEmployee(id: string = "e-test") {
  return prisma.employee.create({
    data: {
      id,
      firstName: "Test",
      lastName: "Employee",
      type: "hourly",
      baseHourlyRate: 35.0,
      superRate: 0.115,
      bankBsb: "123-456",
      bankAccount: "12345678",
    },
  });
}

export async function createTestTimesheet(employeeId: string) {
  return prisma.timesheet.create({
    data: {
      employeeId,
      periodStart: new Date("2025-08-11"),
      periodEnd: new Date("2025-08-17"),
      allowances: 30.0,
      entries: {
        create: [
          {
            date: new Date("2025-08-11"),
            start: "09:00",
            end: "17:30",
            unpaidBreakMins: 30,
          },
          {
            date: new Date("2025-08-12"),
            start: "09:00",
            end: "17:30",
            unpaidBreakMins: 30,
          },
        ],
      },
    },
    include: {
      entries: true,
    },
  });
}
