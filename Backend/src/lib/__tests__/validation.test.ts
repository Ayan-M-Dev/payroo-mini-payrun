import {
  employeeSchema,
  timesheetSchema,
  payrunRequestSchema,
} from "../validation";

describe("Validation Schemas", () => {
  describe("Employee Schema", () => {
    test("should validate correct employee data", () => {
      const validEmployee = {
        id: "e-alice",
        firstName: "Alice",
        lastName: "Chen",
        type: "hourly" as const,
        baseHourlyRate: 35.0,
        superRate: 0.115,
        bank: {
          bsb: "083-123",
          account: "12345678",
        },
      };

      const result = employeeSchema.parse(validEmployee);
      expect(result).toEqual(validEmployee);
    });

    test("should reject employee with missing required fields", () => {
      const invalidEmployee = {
        id: "e-bob",
        firstName: "Bob",
        type: "hourly",
        baseHourlyRate: 48.0,
        superRate: 0.115,
      };

      expect(() => employeeSchema.parse(invalidEmployee)).toThrow();
    });
  });

  describe("Timesheet Schema", () => {
    test("should validate correct timesheet data", () => {
      const validTimesheet = {
        employeeId: "e-alice",
        periodStart: "2025-08-11",
        periodEnd: "2025-08-17",
        entries: [
          {
            date: "2025-08-11",
            start: "09:00",
            end: "17:30",
            unpaidBreakMins: 30,
          },
        ],
        allowances: 30.0,
      };

      const result = timesheetSchema.parse(validTimesheet);
      expect(result).toEqual(validTimesheet);
    });

    test("should reject timesheet with periodEnd before periodStart", () => {
      const invalidTimesheet = {
        employeeId: "e-alice",
        periodStart: "2025-08-17",
        periodEnd: "2025-08-11",
        entries: [
          {
            date: "2025-08-11",
            start: "09:00",
            end: "17:30",
            unpaidBreakMins: 30,
          },
        ],
        allowances: 0,
      };

      expect(() => timesheetSchema.parse(invalidTimesheet)).toThrow();
    });
  });

  describe("PayrunRequest Schema", () => {
    test("should validate correct payrun request data", () => {
      const validPayrunRequest = {
        periodStart: "2025-08-11",
        periodEnd: "2025-08-17",
        employeeIds: ["e-alice", "e-bob"],
      };

      const result = payrunRequestSchema.parse(validPayrunRequest);
      expect(result).toEqual(validPayrunRequest);
    });

    test("should accept payrun request without employeeIds", () => {
      const validPayrunRequest = {
        periodStart: "2025-08-11",
        periodEnd: "2025-08-17",
      };

      const result = payrunRequestSchema.parse(validPayrunRequest);
      expect(result.employeeIds).toBeUndefined();
    });
  });
});
