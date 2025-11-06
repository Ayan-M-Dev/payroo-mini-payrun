# Payroo — Full-Stack Developer Coding Assessment

## Stack: Node.js (TypeScript), React (TypeScript), AWS (optionally LocalStack)

## 1) Purpose & Competencies

This exercise simulates a small slice of Payroo: creating a mini pay run from employee timesheets and producing payslips.

It assesses:

● Backend design (REST API, validation, business logic, tests)  
● Frontend implementation (React UI/UX, accessibility, state mgmt)  
● Data modeling & persistence  
● Code quality (readability, structure, security basics)  
● Optional AWS skills (IaC, serverless/container packaging, storage)

Target time: ~4–6 hours (core). Cloud/IaC and extras are optional.

## 2) Scenario (What to build)

Build a "Mini Payrun" app:

● Ingest employees and timesheets  
● Run a pay run for a given date range (weekly or custom)  
● Calculate gross, simple tax, super, and net for each employee  
● List and view payslips; show a pay run summary

### Business Rules (deliberately simplified for the exercise)

These are not real-world rates—use them exactly as defined here.

● **Gross pay**  
  ○ Hourly employees:  
    gross = normal_hours * base_rate + overtime_hours * base_rate * 1.5 + allowances  
  ○ Weekly overtime threshold: 38 hours (hours above are overtime).

● **Tax (per pay period)** — progressive on the period gross:  
 ○ $0–$370 → 0%  
 ○ $370.01–$900 → 10% of amount over 370  
 ○ $900.01–$1,500 → +19% of amount over 900  
 ○ $1,500.01–$3,000 → +32.5% of amount over 1,500  
 ○ $3,000.01–$5,000 → +37% of amount over 3,000  
 ○ $5,000 → +45% of amount over 5,000

● **Superannuation**: 11.5% of gross (no caps/OTE distinctions here).

● **Net pay**: net = gross – tax (ignore other deductions/reimbursements).

● **Time zone**: Australia/Melbourne. Treat date ranges as inclusive.

## 3) Deliverables

● **Backend (Node.js + TypeScript)**  
 ○ REST API (see OpenAPI below)  
 ○ Validation (e.g., zod/joi or typed DTOs)  
 ○ Persistence: SQLite (via Prisma) or Postgres (DynamoDB acceptable). In-memory is OK only for the live demo but not preferred for submission.  
 ○ Unit tests for tax/super logic & at least one endpoint.  
 ○ Structured logging; basic error handling.

● **Frontend (React + TypeScript)**  
 ○ Pages: Employees, Timesheets, Run Pay, Pay Run Summary/Payslips  
 ○ Use fetch/axios + React Query (or SWR) for data fetching  
 ○ Accessible forms/tables (labels, keyboard nav, focus states)

● **Docs**  
 ○ README.md: setup, run, decisions, trade-offs, time spent  
 ○ DECISIONS.md (short): key decisions & what you would do next

● **(Optional) AWS**  
 ○ IaC (CDK/SAM/Terraform) to deploy API (Lambda/API Gateway) and host UI (S3/CloudFront)  
 ○ Store generated payslip PDFs in S3 (or just JSON if you skip PDFs)  
 ○ LocalStack support is a plus

● **(Optional) CI**  
 ○ GitHub Actions for lint, typecheck, test

## 4) Sample Data (use to seed the app)

### Employees (employees.json)

```json
[
  {
    "id": "e-alice",
    "firstName": "Alice",
    "lastName": "Chen",
    "type": "hourly",
    "baseHourlyRate": 35.0,
    "superRate": 0.115,
    "bank": {
      "bsb": "083-123",
      "account": "12345678"
    }
  },
  {
    "id": "e-bob",
    "firstName": "Bob",
    "lastName": "Singh",
    "type": "hourly",
    "baseHourlyRate": 48.0,
    "superRate": 0.115,
    "bank": {
      "bsb": "062-000",
      "account": "98765432"
    }
  }
]
```

### Timesheets (timesheets.json) — for 2025-08-11 → 2025-08-17

```json
[
  {
    "employeeId": "e-alice",
    "periodStart": "2025-08-11",
    "periodEnd": "2025-08-17",
    "entries": [
      {
        "date": "2025-08-11",
        "start": "09:00",
        "end": "17:30",
        "unpaidBreakMins": 30
      },
      {
        "date": "2025-08-12",
        "start": "09:00",
        "end": "17:30",
        "unpaidBreakMins": 30
      },
      {
        "date": "2025-08-13",
        "start": "09:00",
        "end": "17:30",
        "unpaidBreakMins": 30
      },
      {
        "date": "2025-08-14",
        "start": "09:00",
        "end": "15:00",
        "unpaidBreakMins": 30
      },
      {
        "date": "2025-08-15",
        "start": "10:00",
        "end": "18:00",
        "unpaidBreakMins": 30
      }
    ],
    "allowances": 30.0
  },
  {
    "employeeId": "e-bob",
    "periodStart": "2025-08-11",
    "periodEnd": "2025-08-17",
    "entries": [
      {
        "date": "2025-08-11",
        "start": "08:00",
        "end": "18:00",
        "unpaidBreakMins": 60
      },
      {
        "date": "2025-08-12",
        "start": "08:00",
        "end": "18:00",
        "unpaidBreakMins": 60
      },
      {
        "date": "2025-08-13",
        "start": "08:00",
        "end": "18:00",
        "unpaidBreakMins": 60
      },
      {
        "date": "2025-08-14",
        "start": "08:00",
        "end": "18:00",
        "unpaidBreakMins": 60
      },
      {
        "date": "2025-08-15",
        "start": "08:00",
        "end": "18:00",
        "unpaidBreakMins": 60
      }
    ],
    "allowances": 0.0
  }
]
```

### Reference totals (for grading)

**Period: 2025-08-11 → 2025-08-17**

● **Alice**: 37.0 normal hrs, gross $1,325.00, tax $133.75, super $152.38, net $1,191.25  
● **Bob**: 38.0 normal + 7.0 overtime, gross $2,328.00, tax $436.10, super $267.72, net $1,891.90

**Pay run totals**: gross $3,653.00, tax $569.85, super $420.10, net $3,083.15

## 5) API Contract (OpenAPI 3.1)

Use this as a guide; you can extend it.

```yaml
openapi: 3.1.0
info:
  title: Payroo Mini Payrun API
  version: 1.0.0
servers:
  - url: http://localhost:4000
components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
  schemas:
    Employee:
      type: object
      required: [id, firstName, lastName, type, baseHourlyRate, superRate]
      properties:
        id: { type: string }
        firstName: { type: string }
        lastName: { type: string }
        type: { type: string, enum: [hourly] }
        baseHourlyRate: { type: number }
        superRate: { type: number }
        bank:
          type: object
          properties:
            bsb: { type: string }
            account: { type: string }
    TimesheetEntry:
      type: object
      required: [date, start, end, unpaidBreakMins]
      properties:
        date: { type: string, format: date }
        start: { type: string, example: "09:00" }
        end: { type: string, example: "17:30" }
        unpaidBreakMins: { type: integer }
    Timesheet:
      type: object
      required: [employeeId, periodStart, periodEnd, entries]
      properties:
        employeeId: { type: string }
        periodStart: { type: string, format: date }
        periodEnd: { type: string, format: date }
        entries:
          type: array
          items: { $ref: "#/components/schemas/TimesheetEntry" }
        allowances: { type: number, default: 0 }
    PayrunRequest:
      type: object
      required: [periodStart, periodEnd]
      properties:
        periodStart: { type: string, format: date }
        periodEnd: { type: string, format: date }
        employeeIds:
          type: array
          items: { type: string }
    Payslip:
      type: object
      properties:
        employeeId: { type: string }
        normalHours: { type: number }
        overtimeHours: { type: number }
        gross: { type: number }
        tax: { type: number }
        super: { type: number }
        net: { type: number }
    Payrun:
      type: object
      properties:
        id: { type: string }
        periodStart: { type: string, format: date }
        periodEnd: { type: string, format: date }
        totals:
          type: object
          properties:
            gross: { type: number }
            tax: { type: number }
            super: { type: number }
            net: { type: number }
        payslips:
          type: array
          items: { $ref: "#/components/schemas/Payslip" }
security:
  - bearerAuth: []
paths:
  /health:
    get:
      summary: Liveness
      responses:
        "200": { description: OK }
  /employees:
    get:
      summary: List employees
      responses:
        "200":
          description: OK
          content:
            application/json:
              schema:
                type: array
                items: { $ref: "#/components/schemas/Employee" }
    post:
      summary: Create or upsert employee
      requestBody:
        required: true
        content:
          application/json:
            schema: { $ref: "#/components/schemas/Employee" }
      responses:
        "201": { description: Created }
  /timesheets:
    post:
      summary: Create or replace a timesheet for an employee+period
      requestBody:
        required: true
        content:
          application/json:
            schema: { $ref: "#/components/schemas/Timesheet" }
      responses:
        "201": { description: Created }
  /payruns:
    post:
      summary: Generate a payrun for a period (and optional employee subset)
      requestBody:
        required: true
        content:
          application/json:
            schema: { $ref: "#/components/schemas/PayrunRequest" }
      responses:
        "201":
          description: Created
          content:
            application/json:
              schema: { $ref: "#/components/schemas/Payrun" }
    get:
      summary: List payruns
      responses:
        "200":
          description: OK
  /payruns/{id}:
    get:
      summary: Get a payrun by id
      parameters:
        - in: path
          name: id
          required: true
          schema: { type: string }
      responses:
        "200":
          description: OK
          content:
            application/json:
              schema: { $ref: "#/components/schemas/Payrun" }
  /payslips/{employeeId}/{payrunId}:
    get:
      summary: Get a single employee payslip for a payrun
      parameters:
        - in: path
          name: employeeId
          required: true
          schema: { type: string }
        - in: path
          name: payrunId
          required: true
          schema: { type: string }
      responses:
        "200":
          description: OK
          content:
            application/json:
              schema: { $ref: "#/components/schemas/Payslip" }
```

**Auth (simplified)**: Accept any Bearer token (non-empty). Bonus: implement real JWT with a static public key.

## 6) Frontend Requirements

● **Employees**: list + add/edit (id, name, rate, super)  
● **Timesheets**: pick employee and week; add entries (start/end/break); set allowances  
● **Run Pay**: choose date range, (optionally) select employees; submit → show results  
● **Pay Run Summary**: table of payslips (employee, hours, gross, tax, super, net) + totals  
● **Payslip View**: detail page; (optional) "Download PDF"  
● **Accessibility**: labeled inputs, keyboard navigation, visible focus, table headers (`<th scope>`), color-contrast friendly.

## 7) Non-functional Requirements

● TypeScript everywhere  
● Lint/format (eslint + prettier)  
● Validation for all inputs (e.g., zod schemas shared client/server)  
● Basic security: avoid eval/SSRFi, validate/escape, don't log secrets, use Helmet/CORS properly  
● Logging: JSON logs (level, msg, reqId)  
● Testing:  
 ○ Unit tests for tax/super/overtime logic (include edge cases around bracket cutovers)  
 ○ 1–2 API tests (happy path + validation error)  
 ○ (Optional) minimal UI test with Playwright

## 8) Optional AWS Track (bonus)

● **API**: Lambda + API Gateway (Node18+), or ECS Fargate  
● **Storage**: RDS (Postgres) or DynamoDB; or SQLite for local  
● **Static UI**: S3 + CloudFront  
● **IaC**: CDK/Terraform/SAM with README deploy steps  
● **Observability**: CloudWatch logs/metrics; structured JSON; simple /metrics endpoint

## 9) Grading Rubric (100 pts)

● **Correctness & Business Logic (35)** – calculations match reference totals; edge cases OK  
● **Code Quality & Architecture (20)** – modularity, typing, separation of concerns  
● **Validation, Security & Errors (10)** – schema validation, safe defaults, error responses  
● **Testing (15)** – coverage of core logic; a couple integration tests  
● **Frontend UX & Accessibility (10)** – clean flows, accessible forms/tables  
● **Docs & DevEx (5)** – clear README, scripts, decisions  
● **Performance & Observability (5)** – sensible indexing/queries, structured logs  
● **Bonus: AWS/IaC/CI (up to +10)** – deployable stack, S3 PDFs, GH Actions

## 10) Getting Started (suggested structure)

```
/api
  src/
    domain/ (calc, tax tables, types)
    routes/ (employees, timesheets, payruns)
    lib/ (db, logger, auth)
  test/ (unit + integration)
  prisma/ (if using Prisma)
  package.json
/web
  src/
    pages/ (Employees, Timesheets, RunPay, Summary, Payslip)
    api/ (client)
    components/ (Table, Form, Field)
  package.json
/openapi.yaml
/README.md
/DECISIONS.md
/docker-compose.yml  # optional
/infra/              # optional (CDK/Terraform/SAM)
```

### NPM Scripts (example)

● `api:dev`, `api:test`, `api:lint`, `api:typecheck`  
● `web:dev`, `web:build`  
● `dev` (concurrently run api + web)

## 11) What to Submit

● Link to a Git repo (public or with an invited reviewer account)  
● Include:  
 ○ Working app (local instructions)  
 ○ Tests  
 ○ The two sample JSON files seeded and commands to import/seed  
 ○ Short Loom/GIF demo (optional)

## 12) Notes & Tips

● Keep it production-ish but don't overbuild; use stubs where needed.  
● Prefer correctness, clarity, and tests over polishing every edge.  
● The tax table is intentionally simplified—do not swap in real ATO tables.
