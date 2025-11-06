# Payroo Mini Payrun

A full-stack payroll management application. This application allows you to manage employees, track timesheets, and generate pay runs with automatic calculation of gross pay, tax, superannuation, and net pay.

## 🚀 Features

- **Employee Management**: Create and manage employee records with hourly rates and superannuation rates
- **Timesheet Tracking**: Record employee work hours with entries for multiple dates
- **Payrun Generation**: Automatically generate pay runs for employees with calculations for:
  - Normal and overtime hours (38-hour threshold)
  - Gross pay (hourly rate + 1.5x overtime + allowances)
  - Progressive tax calculation (6 tax brackets)
  - Superannuation (11.5% of gross)
  - Net pay (gross - tax)
- **Payslip Viewing**: View detailed payslips for individual employees
- **JWT Authentication**: Secure authentication with JWT tokens (RSA256)
- **Structured Logging**: JSON logs with request IDs for tracing
- **Full TypeScript**: Type-safe codebase throughout

## 🛠️ Tech Stack

### Backend

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: SQLite with Prisma ORM
- **Validation**: Zod schemas
- **Authentication**: JWT (RSA256) with simplified Bearer token support
- **Logging**: Pino (structured JSON logging)
- **Testing**: Jest + Supertest

### Frontend

- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **Routing**: React Router DOM
- **State Management**: React Query (TanStack Query)
- **Forms**: React Hook Form + Zod validation
- **UI Components**: Shadcn UI + Tailwind CSS
- **Styling**: Tailwind CSS
- **Notifications**: Sonner (toast notifications)

## 📋 Prerequisites

- Node.js 20+ (or 22+)
- npm or yarn
- Git

## 🔧 Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd payroo-mini-payrun
```

### 2. Install Backend Dependencies

```bash
cd Backend
npm install
```

### 3. Install Frontend Dependencies

```bash
cd ../Frontend
npm install
```

### 4. Set Up Environment Variables

Create a `.env` file in the `Backend` directory:

```bash
cd Backend
```

Create `.env` file with:

```env
DATABASE_URL="file:./dev.db"
PORT=4000
LOG_LEVEL="info"
```

### 5. Set Up Database

```bash
# Generate Prisma Client
npx prisma generate

# Run database migrations
npx prisma migrate deploy
```

### 6. Generate JWT Keys (for JWT authentication)

```bash
npm run generate-keys
```

This creates `keys/private-key.pem` and `keys/public-key.pem` in the Backend directory.

**Note**: The `keys/private-key.pem` file is gitignored for security. Make sure to generate it before using JWT authentication.

### 7. Seed Sample Data (Optional)

```bash
npm run seed
```

This loads sample employee and timesheet data from `../Data/employees.json` and `../Data/timesheets.json`.

## 🏃 Running the Application

### Backend

#### Development Mode

```bash
cd Backend
npm run dev
```

The backend will start on `http://localhost:4000`

#### Production Mode

```bash
cd Backend
npm run build
npm start
```

### Frontend

#### Development Mode

```bash
cd Frontend
npm run dev
```

The frontend will start on `http://localhost:5173` (or another port if 5173 is occupied)

#### Production Build

```bash
cd Frontend
npm run build
npm run preview
```

## 🧪 Testing

### Backend Tests

```bash
cd Backend

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- payroll.test.ts
npm test -- api.test.ts
npm test -- validation.test.ts
```

### Test Coverage

- **Unit Tests**: Domain logic tests (`domain/__tests__/payroll.test.ts`)
- **Integration Tests**: API endpoint tests (`test/api.test.ts`)
- **Validation Tests**: Schema validation tests (`lib/__tests__/validation.test.ts`)

### Frontend Linting

```bash
cd Frontend
npm run lint
npm run lint:fix
```

### Code Formatting

```bash
# Backend
cd Backend
npm run format

# Frontend
cd Frontend
npm run format
```

## 📡 API Endpoints

### Public Endpoints

- `GET /health` - Health check (no authentication required)

### Authentication

- `POST /auth/login` - Login and get JWT token
  ```json
  {
    "userId": "user-123",
    "email": "user@example.com"
  }
  ```

### Protected Endpoints (Require Bearer Token)

#### Employees

- `GET /employees` - Get all employees
- `GET /employees/:id` - Get employee by ID
- `POST /employees` - Create or update employee

#### Timesheets

- `POST /timesheets` - Create or replace timesheet for an employee

#### Payruns

- `POST /payruns` - Generate a payrun for a period
- `GET /payruns` - Get all payruns
- `GET /payruns/:id` - Get payrun by ID

#### Payslips

- `GET /payslips/:employeeId/:payrunId` - Get payslip for an employee in a payrun

## 🔐 Authentication

The API supports two authentication methods:

1. **Simplified Bearer Token** (Basic requirement): Accepts any non-empty Bearer token
2. **JWT Authentication** (Bonus): Uses RSA256 with static public key

To use JWT authentication:

1. Generate keys: `npm run generate-keys` (in Backend directory)
2. Login via `POST /auth/login` to get a JWT token
3. Use the token in the `Authorization: Bearer <token>` header

## 📁 Project Structure

```
payroo-mini-payrun/
├── Backend/
│   ├── src/
│   │   ├── domain/          # Business logic (calculations)
│   │   ├── lib/             # Utilities (auth, validation, logging)
│   │   ├── routes/          # API route handlers
│   │   ├── services/        # Database service layer
│   │   ├── test/            # Integration tests
│   │   └── types/           # TypeScript type definitions
│   ├── prisma/
│   │   ├── schema.prisma    # Database schema
│   │   └── migrations/      # Database migrations
│   └── keys/                # JWT keys (gitignored)
├── Frontend/
│   ├── src/
│   │   ├── api/             # API client functions
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   └── utils/           # Utility functions
│   └── public/              # Static assets
└── Data/                    # Sample data files
    ├── employees.json
    └── timesheets.json
```

## 💾 Database Schema

The application uses SQLite with the following main entities:

- **Employee**: Employee information (id, name, rates, bank details)
- **Timesheet**: Timesheet for a period (employeeId, periodStart, periodEnd, allowances)
- **TimesheetEntry**: Individual day entries (date, start, end, unpaidBreakMins)
- **Payrun**: Generated payrun (periodStart, periodEnd, totals)
- **Payslip**: Individual payslip (employeeId, payrunId, calculations)

## 🧮 Payroll Calculations

### Hours Calculation

- Normal hours: Up to 38 hours per week
- Overtime hours: Hours exceeding 38 hours (paid at 1.5x rate)

### Tax Calculation (Progressive)

- $0–$370 → 0%
- $370.01–$900 → 10% of amount over $370
- $900.01–$1,500 → +19% of amount over $900
- $1,500.01–$3,000 → +32.5% of amount over $1,500
- $3,000.01–$5,000 → +37% of amount over $3,000
- $5,000+ → +45% of amount over $5,000

### Superannuation

- Default rate: 11.5% of gross pay
- Configurable per employee

### Net Pay

- Net Pay = Gross Pay - Tax

## 📝 Example Usage

### 1. Create Employees

```bash
POST /employees
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
}
```

### 2. Create Timesheet

```bash
POST /timesheets
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
    }
  ],
  "allowances": 30.0
}
```

### 3. Generate Payrun

```bash
POST /payruns
{
  "periodStart": "2025-08-11",
  "periodEnd": "2025-08-17",
  "employeeIds": ["e-alice", "e-bob"]
}
```

## 🐛 Troubleshooting

### Database Issues

If you encounter database errors:

```bash
cd Backend
npx prisma migrate reset  # Resets database (WARNING: deletes all data)
npx prisma migrate deploy  # Applies migrations
```

### Port Already in Use

If port 4000 is already in use, update `PORT` in `Backend/.env`:

```env
PORT=4001
```

### JWT Keys Missing

If JWT authentication fails:

```bash
cd Backend
npm run generate-keys
```

## 📚 Additional Resources

- Postman Collection: `payroo-mini.json` (included in project root)
- Assessment Requirements: `ASSESSMENT.md`
- API follows OpenAPI 3.1 specification (as per assessment requirements)

## 🎯 Key Features Implemented

✅ RESTful API with all required endpoints  
✅ Zod validation for all endpoints  
✅ SQLite database with Prisma ORM  
✅ Progressive tax calculation  
✅ Overtime calculation (38-hour threshold)  
✅ Superannuation calculation  
✅ JWT authentication (bonus feature)  
✅ Structured JSON logging with request IDs  
✅ Unit tests for domain logic  
✅ Integration tests for API endpoints  
✅ Frontend with React + TypeScript  
✅ Form validation with React Hook Form + Zod  
✅ Accessible UI with proper labels and ARIA attributes  
✅ ESLint and Prettier configuration

## 👤 Author

Ayan M
Built for Payroo coding assessment
