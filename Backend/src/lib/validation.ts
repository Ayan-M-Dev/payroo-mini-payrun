import { z } from "zod";

const timeStringSchema = z
  .string()
  .regex(
    /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/,
    "Time must be in HH:MM format (e.g., 09:00)"
  );

const dateStringSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format");

const bankSchema = z
  .object({
    bsb: z.string().min(1, "BSB is required"),
    account: z.string().min(1, "Account number is required"),
  })
  .optional();

export const employeeSchema = z.object({
  id: z.string().min(1, "Employee ID is required"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  type: z.enum(["hourly"], {
    message: "Employee type must be 'hourly'",
  }),
  baseHourlyRate: z.number().positive("Base hourly rate must be positive"),
  superRate: z.number().min(0).max(1, "Super rate must be between 0 and 1"),
  bank: bankSchema,
});

export const timesheetEntrySchema = z.object({
  date: dateStringSchema,
  start: timeStringSchema,
  end: timeStringSchema,
  unpaidBreakMins: z
    .number()
    .int()
    .min(0, "Unpaid break minutes must be non-negative"),
});

export const timesheetSchema = z
  .object({
    employeeId: z.string().min(1, "Employee ID is required"),
    periodStart: dateStringSchema,
    periodEnd: dateStringSchema,
    entries: z
      .array(timesheetEntrySchema)
      .min(1, "At least one entry is required"),
    allowances: z.number().min(0).default(0),
  })
  .refine(
    (data) => {
      const start = new Date(data.periodStart);
      const end = new Date(data.periodEnd);
      return end >= start;
    },
    {
      message: "periodEnd must be after or equal to periodStart",
      path: ["periodEnd"],
    }
  );

export const payrunRequestSchema = z
  .object({
    periodStart: dateStringSchema,
    periodEnd: dateStringSchema,
    employeeIds: z.array(z.string().min(1)).optional(),
  })
  .refine(
    (data) => {
      const start = new Date(data.periodStart);
      const end = new Date(data.periodEnd);
      return end >= start;
    },
    {
      message: "periodEnd must be after or equal to periodStart",
      path: ["periodEnd"],
    }
  );

export const payslipSchema = z.object({
  employeeId: z.string(),
  normalHours: z.number().min(0),
  overtimeHours: z.number().min(0),
  gross: z.number().min(0),
  tax: z.number().min(0),
  super: z.number().min(0),
  net: z.number(),
});

const payrunTotalsSchema = z.object({
  gross: z.number().min(0),
  tax: z.number().min(0),
  super: z.number().min(0),
  net: z.number(),
});

export const payrunSchema = z.object({
  id: z.string(),
  periodStart: dateStringSchema,
  periodEnd: dateStringSchema,
  totals: payrunTotalsSchema,
  payslips: z.array(payslipSchema),
});

export type EmployeeInput = z.infer<typeof employeeSchema>;
export type TimesheetEntryInput = z.infer<typeof timesheetEntrySchema>;
export type TimesheetInput = z.infer<typeof timesheetSchema>;
export type PayrunRequestInput = z.infer<typeof payrunRequestSchema>;
export type PayslipOutput = z.infer<typeof payslipSchema>;
export type PayrunOutput = z.infer<typeof payrunSchema>;
