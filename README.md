# Payroo Mini Payrun

A full-stack payroll management application. This application allows you to manage employees, track timesheets, and generate pay runs with automatic calculation of gross pay, tax, superannuation, and net pay.
[![Employee Management System Overview](https://cdn.loom.com/sessions/thumbnails/df8592c4acfb4f8f96111806c4f0f2c7-97b6741663b9c7db-full-play.gif)](https://www.loom.com/share/df8592c4acfb4f8f96111806c4f0f2c7)

**[Watch Full Video →](https://www.loom.com/share/df8592c4acfb4f8f96111806c4f0f2c7)**

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
- **Database**: PostgreSQL with Prisma ORM (Docker for local development)
- **Validation**: Zod schemas
- **Authentication**: JWT (RSA256) with simplified Bearer token support
- **Logging**: Pino (structured JSON logging)
- **Testing**: Jest + Supertest
- **Deployement**: Local + AWS (Setup)

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
- Docker and Docker Compose

## 🔧 Installation

### Quick Start with Docker Compose (Recommended)

The easiest way to get started is using Docker Compose, which handles everything automatically:

```bash
# Clone the repository
git clone https://github.com/Ayan-M-Dev/payroo-mini-payrun.git
cd payroo-mini-payrun
```

```bash
# Start all services (this will automatically):
# - Build backend and frontend images
# - Start PostgreSQL database
# - Generate JWT keys
# - Run database migrations
# - Start the application
docker-compose build
```

```bash
docker-compose up -d
```

That's it! The application will be available at:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000

```json
{
  "userId": "any-user-id",
  "email": "any@email.com"
}
```

**Note**: You can use any valid user ID and email address to log in. No user database validation is performed

**What happens automatically:**

- ✅ JWT keys are generated automatically (`Backend/keys/`)
- ✅ Prisma client is generated
- ✅ Database migrations are applied
- ✅ All services start in the correct order

### Seed Sample Data (Optional)

To load sample employee and timesheet data:

```bash
docker-compose exec backend npm run seed
```

This loads sample data from `Data/employees.json` and `Data/timesheets.json`.

### Manual Setup (Without Docker)

If you prefer to run without Docker, you'll need to:

1. **Install dependencies:**

   ```bash
   cd Backend && npm install
   cd ../Frontend && npm install
   ```

2. **Set up PostgreSQL database** (you'll need PostgreSQL running locally)

3. **Create `.env` file** in `Backend/`:

   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/payroo"
   PORT=4000
   LOG_LEVEL="info"
   ```

4. **Generate Prisma client and run migrations:**

   ```bash
   cd Backend
   npx prisma generate
   npx prisma migrate deploy
   ```

5. **Generate JWT keys:**

   ```bash
   npm run generate-keys
   ```

6. **Seed database (optional):**
   ```bash
   npm run seed
   ```

## 🏃 Running the Application

### Using Docker Compose (Recommended)

**Start all services:**

```bash
docker-compose up -d
```

**View logs:**

```bash
docker-compose logs -f
```

**Stop all services:**

```bash
docker-compose down
```

**Rebuild after code changes:**

```bash
docker-compose up -d --build
```

### Manual Development (Without Docker)

#### Backend

**Development Mode:**

```bash
cd Backend
npm run dev
```

The backend will start on `http://localhost:4000`

**Production Mode:**

```bash
cd Backend
npm run build
npm start
```

#### Frontend

**Development Mode:**

```bash
cd Frontend
npm run dev
```

The frontend will start on `http://localhost:5173` (or another port if 5173 is occupied)

**Production Build:**

```bash
cd Frontend
npm run build
npm run preview
```

## 🧪 Testing

### Backend Tests

**Note**: Tests require PostgreSQL to be running. The test setup automatically configures `DATABASE_URL` to use PostgreSQL (either the local Docker database or CI test database).

```bash
cd Backend

# Make sure PostgreSQL is running (if testing locally)
docker-compose up -d postgres

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
2. **JWT Authentication** : Uses RSA256 with static public key

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

The application uses PostgreSQL with the following main entities:

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

If you encounter database errors with Docker Compose:

```bash
# Reset everything (WARNING: deletes all data)
docker-compose down -v
docker-compose up -d

# Or just restart the backend to re-run migrations
docker-compose restart backend
```

For manual setup:

```bash
cd Backend
npm run db:migrate  # Run migrations on existing database
```

### Port Already in Use

If port 4000 is already in use, update `PORT` in `Backend/.env`:

```env
PORT=4001
```

### JWT Keys Missing

With Docker Compose, keys are generated automatically. If you need to regenerate:

```bash
# Remove keys and restart
rm -rf Backend/keys/*  # Linux/Mac
# or
Remove-Item Backend\keys\*  # Windows PowerShell
docker-compose restart backend
```

For manual setup:

```bash
cd Backend
npm run generate-keys
```

## 🐳 Docker Setup

Docker Compose is the recommended way to run the application. It handles everything automatically:

**Quick commands:**

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Rebuild after code changes
docker-compose up -d --build

# Seed sample data
docker-compose exec backend npm run seed
```

## ☁️ AWS Deployment

The application can be deployed to AWS using AWS CDK. See `AWS_DEPLOYMENT_GUIDE.md` for complete deployment instructions.

**Quick deploy:**

```bash
./deploy.sh  # Linux/Mac
# or
deploy.bat   # Windows
```

## 📚 Additional Resources

- Docker Setup: `DOCKER_SETUP.md` (local development with Docker)
- AWS Deployment: `AWS_DEPLOYMENT_GUIDE.md` (complete AWS deployment guide)
- Assessment Requirements: `ASSESSMENT.md`
- Key Decisions: `DECISIONS.md` (detailed architectural decisions and trade-offs)
- API follows OpenAPI 3.1 specification (as per assessment requirements)

## 🎯 Key Features Implemented

✅ RESTful API with all required endpoints  
✅ Zod validation for all endpoints  
✅ PostgreSQL database with Prisma ORM (Docker for local dev)  
✅ Progressive tax calculation  
✅ Overtime calculation (38-hour threshold)  
✅ Superannuation calculation  
✅ JWT authentication  
✅ Structured JSON logging with request IDs  
✅ Unit tests for domain logic  
✅ Integration tests for API endpoints  
✅ Frontend with React + TypeScript  
✅ Form validation with React Hook Form + Zod  
✅ Accessible UI with proper labels and ARIA attributes  
✅ ESLint and Prettier configuration  
✅ GitHub Actions CI/CD pipeline

**Summary of key decisions:**

- **Database**: PostgreSQL with Prisma ORM (Docker for local development, RDS for AWS production)
- **Validation**: Zod schemas (shared between frontend and backend)
- **Authentication**: JWT with RSA256 + simplified Bearer token (requirement)
- **State Management**: React Query (excellent for REST APIs)
- **UI Components**: Shadcn UI + Tailwind CSS (accessible, customizable)
- **Architecture**: Domain-driven design with clear separation of concerns

## ⚖️ Trade-offs

### Simplicity vs Scalability

- **Chose**: PostgreSQL for production-ready database with Docker for local development
- **Trade-off**: Requires Docker setup for local development
- **Benefit**: Production-ready, supports concurrent writes, suitable for high-traffic production

### Type Safety vs Development Speed

- **Chose**: Comprehensive TypeScript typing throughout
- **Trade-off**: More initial setup time, slightly more verbose code
- **Benefit**: Fewer runtime errors, better IDE support, easier refactoring

### Framework Complexity vs Flexibility

- **Chose**: Express.js (lightweight) over NestJS (more opinionated)
- **Trade-off**: Less structure out of the box
- **Benefit**: More flexibility, faster development, easier to understand

## ⏱️ Time Spent

**Total Estimated Time**: ~10 hours

**Breakdown:**

- **Backend Setup & API Development**: ~2 hours
  - Express setup, Prisma schema, routes, services
  - Domain logic (tax, super, overtime calculations)
  - Validation schemas, error handling, logging
- **Frontend Development**: ~2 hours
  - React setup, routing, pages
  - Forms with validation, tables, UI components
  - API integration with React Query
- **Testing**: ~2 hour
  - Unit tests for domain logic
  - Integration tests for API endpoints
  - Test setup and helpers
- **Polish & Documentation**: ~10 hour
  - Code cleanup, linting, formatting, AWS PDF
  - README, DECISIONS.md, code comments
  - CI/CD setup (GitHub Actions)

## 👤 Author

Ayan M  
Built for Payroo coding assessment
