import request from "supertest";
import app from "../app";
import {
  cleanupDatabase,
  createTestEmployee,
  createTestTimesheet,
  getAuthHeader,
} from "./helpers";
import prisma from "../lib/db";

describe("API Integration Tests", () => {
  beforeAll(async () => {
    await cleanupDatabase();
  });

  afterAll(async () => {
    await cleanupDatabase();
    await prisma.$disconnect();
  });

  describe("Health Check", () => {
    it("GET /health should return 200 OK", async () => {
      const response = await request(app).get("/health");
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ status: "ok" });
    });
  });

  describe("Authentication", () => {
    it("should return 401 without Authorization header", async () => {
      const response = await request(app).get("/employees");
      expect(response.status).toBe(401);
      expect(response.body.error).toBeDefined();
    });

    it("should return 401 with empty token", async () => {
      const response = await request(app)
        .get("/employees")
        .set("Authorization", "Bearer ");
      expect(response.status).toBe(401);
    });

    it("should accept valid Bearer token", async () => {
      await createTestEmployee("e-auth-test");

      const response = await request(app)
        .get("/employees")
        .set(getAuthHeader());
      expect(response.status).toBe(200);
    });
  });

  describe("Employees API - Happy Path", () => {
    it("POST /employees should create a new employee", async () => {
      const employeeData = {
        id: "e-alice",
        firstName: "Alice",
        lastName: "Chen",
        type: "hourly",
        baseHourlyRate: 35.0,
        superRate: 0.115,
        bank: {
          bsb: "083-123",
          account: "12345678",
        },
      };

      const response = await request(app)
        .post("/employees")
        .set(getAuthHeader())
        .send(employeeData);

      expect(response.status).toBe(201);
      expect(response.body.id).toBe("e-alice");
      expect(response.body.firstName).toBe("Alice");
      expect(response.body.lastName).toBe("Chen");
      expect(response.body.bank.bsb).toBe("083-123");
    });

    it("GET /employees should return list of employees", async () => {
      const response = await request(app)
        .get("/employees")
        .set(getAuthHeader());

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it("GET /employees/:id should return specific employee", async () => {
      const response = await request(app)
        .get("/employees/e-alice")
        .set(getAuthHeader());

      expect(response.status).toBe(200);
      expect(response.body.id).toBe("e-alice");
    });

    it("POST /employees should upsert existing employee", async () => {
      const employeeData = {
        id: "e-alice",
        firstName: "Alice",
        lastName: "Chen-Updated",
        type: "hourly",
        baseHourlyRate: 36.0,
        superRate: 0.115,
        bank: {
          bsb: "083-123",
          account: "12345678",
        },
      };

      const response = await request(app)
        .post("/employees")
        .set(getAuthHeader())
        .send(employeeData);

      expect(response.status).toBe(201);
      expect(response.body.lastName).toBe("Chen-Updated");
      expect(response.body.baseHourlyRate).toBe(36.0);
    });
  });

  describe("Employees API - Validation Errors", () => {
    it("should return 400 for missing required fields", async () => {
      const invalidData = {
        id: "e-invalid",
        firstName: "Test",
      };

      const response = await request(app)
        .post("/employees")
        .set(getAuthHeader())
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("Validation error");
      expect(response.body.details).toBeDefined();
    });

    it("should return 400 for invalid employee type", async () => {
      const invalidData = {
        id: "e-invalid-type",
        firstName: "Test",
        lastName: "User",
        type: "salaried",
        baseHourlyRate: 35.0,
        superRate: 0.115,
      };

      const response = await request(app)
        .post("/employees")
        .set(getAuthHeader())
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("Validation error");
    });

    it("should return 400 for negative hourly rate", async () => {
      const invalidData = {
        id: "e-invalid-rate",
        firstName: "Test",
        lastName: "User",
        type: "hourly",
        baseHourlyRate: -10,
        superRate: 0.115,
      };

      const response = await request(app)
        .post("/employees")
        .set(getAuthHeader())
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("Validation error");
    });

    it("should return 404 for non-existent employee", async () => {
      const response = await request(app)
        .get("/employees/non-existent-id")
        .set(getAuthHeader());

      expect(response.status).toBe(404);
      expect(response.body.error).toBe("Employee not found");
    });
  });

  describe("Timesheets API - Happy Path", () => {
    beforeEach(async () => {
      await createTestEmployee("e-timesheet-test");
    });

    it("POST /timesheets should create a new timesheet", async () => {
      const timesheetData = {
        employeeId: "e-timesheet-test",
        periodStart: "2025-08-11",
        periodEnd: "2025-08-17",
        entries: [
          {
            date: "2025-08-11",
            start: "09:00",
            end: "17:30",
            unpaidBreakMins: 30,
          },
          {
            date: "2025-08-12",
            start: "09:00",
            end: "17:30",
            unpaidBreakMins: 30,
          },
        ],
        allowances: 30.0,
      };

      const response = await request(app)
        .post("/timesheets")
        .set(getAuthHeader())
        .send(timesheetData);

      expect(response.status).toBe(201);
      expect(response.body.employeeId).toBe("e-timesheet-test");
      expect(response.body.entries).toHaveLength(2);
      expect(response.body.allowances).toBe(30.0);
    });
  });

  describe("Timesheets API - Validation Errors", () => {
    it("should return 400 for invalid date format", async () => {
      const invalidData = {
        employeeId: "e-test",
        periodStart: "invalid-date",
        periodEnd: "2025-08-17",
        entries: [],
        allowances: 0,
      };

      const response = await request(app)
        .post("/timesheets")
        .set(getAuthHeader())
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("Validation error");
    });

    it("should return 400 for periodEnd before periodStart", async () => {
      const invalidData = {
        employeeId: "e-test",
        periodStart: "2025-08-17",
        periodEnd: "2025-08-11",
        entries: [],
        allowances: 0,
      };

      const response = await request(app)
        .post("/timesheets")
        .set(getAuthHeader())
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("Validation error");
    });

    it("should return 400 for invalid time format", async () => {
      const invalidData = {
        employeeId: "e-test",
        periodStart: "2025-08-11",
        periodEnd: "2025-08-17",
        entries: [
          {
            date: "2025-08-11",
            start: "25:00",
            end: "17:30",
            unpaidBreakMins: 30,
          },
        ],
        allowances: 0,
      };

      const response = await request(app)
        .post("/timesheets")
        .set(getAuthHeader())
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("Validation error");
    });

    it("should return 404 for non-existent employee", async () => {
      const timesheetData = {
        employeeId: "non-existent-employee",
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
        allowances: 0,
      };

      const response = await request(app)
        .post("/timesheets")
        .set(getAuthHeader())
        .send(timesheetData);

      expect(response.status).toBe(404);
      expect(response.body.error).toContain("not found");
    });
  });

  describe("Payruns API - Happy Path", () => {
    beforeEach(async () => {
      await cleanupDatabase();
      const employee = await createTestEmployee("e-payrun-test");
      await createTestTimesheet(employee.id);
    });

    it("POST /payruns should generate a payrun", async () => {
      const payrunData = {
        periodStart: "2025-08-11",
        periodEnd: "2025-08-17",
        employeeIds: ["e-payrun-test"],
      };

      const response = await request(app)
        .post("/payruns")
        .set(getAuthHeader())
        .send(payrunData);

      expect(response.status).toBe(201);
      expect(response.body.id).toBeDefined();
      expect(response.body.totals).toBeDefined();
      expect(response.body.totals.gross).toBeGreaterThan(0);
      expect(response.body.payslips).toHaveLength(1);
      expect(response.body.payslips[0].employeeId).toBe("e-payrun-test");
    });

    it("GET /payruns should return list of payruns", async () => {
      const response = await request(app).get("/payruns").set(getAuthHeader());

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it("GET /payruns/:id should return specific payrun", async () => {
      const payrunData = {
        periodStart: "2025-08-11",
        periodEnd: "2025-08-17",
      };

      const createResponse = await request(app)
        .post("/payruns")
        .set(getAuthHeader())
        .send(payrunData);

      const payrunId = createResponse.body.id;

      const response = await request(app)
        .get(`/payruns/${payrunId}`)
        .set(getAuthHeader());

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(payrunId);
    });
  });

  describe("Payruns API - Validation Errors", () => {
    it("should return 400 for invalid date format", async () => {
      const invalidData = {
        periodStart: "invalid-date",
        periodEnd: "2025-08-17",
      };

      const response = await request(app)
        .post("/payruns")
        .set(getAuthHeader())
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("Validation error");
    });

    it("should return 404 when no timesheets found", async () => {
      await cleanupDatabase();

      const payrunData = {
        periodStart: "2025-08-11",
        periodEnd: "2025-08-17",
      };

      const response = await request(app)
        .post("/payruns")
        .set(getAuthHeader())
        .send(payrunData);

      expect(response.status).toBe(404);
      expect(response.body.error).toContain("No timesheets found");
    });
  });

  describe("Payslips API", () => {
    beforeEach(async () => {
      await cleanupDatabase();
      const employee = await createTestEmployee("e-payslip-test");
      await createTestTimesheet(employee.id);
    });

    it("GET /payslips/:employeeId/:payrunId should return payslip", async () => {
      const payrunData = {
        periodStart: "2025-08-11",
        periodEnd: "2025-08-17",
        employeeIds: ["e-payslip-test"],
      };

      const payrunResponse = await request(app)
        .post("/payruns")
        .set(getAuthHeader())
        .send(payrunData);

      const payrunId = payrunResponse.body.id;

      const response = await request(app)
        .get(`/payslips/e-payslip-test/${payrunId}`)
        .set(getAuthHeader());

      expect(response.status).toBe(200);
      expect(response.body.employeeId).toBe("e-payslip-test");
      expect(response.body.gross).toBeGreaterThan(0);
      expect(response.body.tax).toBeGreaterThanOrEqual(0);
      expect(response.body.net).toBeGreaterThan(0);
    });

    it("should return 404 for non-existent payslip", async () => {
      const response = await request(app)
        .get("/payslips/non-existent/also-non-existent")
        .set(getAuthHeader());

      expect(response.status).toBe(404);
      expect(response.body.error).toBe("Payslip not found");
    });
  });
});
