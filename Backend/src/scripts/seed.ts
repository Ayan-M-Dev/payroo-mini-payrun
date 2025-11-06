import dotenv from "dotenv";
import { readFileSync } from "fs";
import { join } from "path";

dotenv.config();

import prisma from "../lib/db";
import * as employeeService from "../services/employeeService";
import * as timesheetService from "../services/timesheetService";
import { EmployeeInput, TimesheetInput } from "../lib/validation";

const DATA_DIR = join(process.cwd(), "..", "data");

function loadJsonFile(filename: string): unknown {
  const filePath = join(DATA_DIR, filename);
  try {
    const content = readFileSync(filePath, "utf-8");
    return JSON.parse(content);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(`Error reading ${filename}:`, message);
    throw error;
  }
}

async function seedEmployees() {
  console.log("📦 Loading employees...");
  const employees = loadJsonFile("employees.json") as EmployeeInput[];

  let created = 0;
  let updated = 0;

  for (const employeeData of employees) {
    try {
      const existing = await employeeService.getEmployeeById(employeeData.id);

      await employeeService.upsertEmployee(employeeData);

      if (existing) {
        updated++;
        console.log(
          `  ✓ Updated employee: ${employeeData.id} (${employeeData.firstName} ${employeeData.lastName})`
        );
      } else {
        created++;
        console.log(
          `  ✓ Created employee: ${employeeData.id} (${employeeData.firstName} ${employeeData.lastName})`
        );
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      console.error(
        `  ✗ Error processing employee ${employeeData.id}:`,
        message
      );
    }
  }

  console.log(
    `\n✅ Employees seeded: ${created} created, ${updated} updated\n`
  );
}

async function seedTimesheets() {
  console.log("📅 Loading timesheets...");
  const timesheets = loadJsonFile("timesheets.json") as TimesheetInput[];

  let created = 0;
  let errors = 0;

  for (const timesheetData of timesheets) {
    try {
      const employee = await employeeService.getEmployeeById(
        timesheetData.employeeId
      );
      if (!employee) {
        console.error(
          `  ✗ Employee ${timesheetData.employeeId} not found, skipping timesheet`
        );
        errors++;
        continue;
      }

      await timesheetService.upsertTimesheet(timesheetData);
      created++;
      console.log(
        `  ✓ Created/updated timesheet for ${timesheetData.employeeId} (${timesheetData.periodStart} to ${timesheetData.periodEnd})`
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      console.error(
        `  ✗ Error processing timesheet for ${timesheetData.employeeId}:`,
        message
      );
      errors++;
    }
  }

  console.log(
    `\n✅ Timesheets seeded: ${created} created/updated, ${errors} errors\n`
  );
}

async function seed() {
  console.log("🌱 Starting database seed...\n");

  try {
    await seedEmployees();
    await seedTimesheets();

    console.log("✨ Seed completed successfully!\n");

    const employeeCount = await prisma.employee.count();
    const timesheetCount = await prisma.timesheet.count();
    const entryCount = await prisma.timesheetEntry.count();

    console.log("📊 Database Summary:");
    console.log(`   Employees: ${employeeCount}`);
    console.log(`   Timesheets: ${timesheetCount}`);
    console.log(`   Timesheet Entries: ${entryCount}\n`);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("❌ Seed failed:", message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  seed();
}

export { seed };
