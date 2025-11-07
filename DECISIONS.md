# Key Decisions & Architecture Choices

## Technology Stack

**Backend**: Node.js + TypeScript + Express

- TypeScript for type safety, Express for lightweight REST API

**Database**: PostgreSQL with Prisma ORM

- Production-ready database, Docker for local development, RDS for AWS deployment

**Validation**: Zod Schemas

- TypeScript-first, share schemas between frontend/backend

**Authentication**: JWT with RSA256

- Secure public/private key pair, also supports simplified Bearer token

**Frontend**: React + TypeScript + Vite

- React 19 with TypeScript, Vite for fast development

**State Management**: React Query

- Automatic caching, built-in loading/error states

**UI Components**: Shadcn UI + Tailwind CSS

- Accessible components, easy to customize

## Architecture

**Structure**: Domain-driven design

```
domain/     - Business logic (calculations)
lib/        - Utilities (auth, validation, logging)
routes/     - API route handlers
services/   - Database service layer
```

**Error Handling**: Centralized with AppError class

- Consistent error responses, structured logging

**Logging**: Structured JSON with Pino

- Machine-readable logs, request IDs for tracing

**Testing**: Unit + Integration

- Unit tests for domain logic, integration tests for API

## What Would Be Done Next

**Short-term**: Error boundaries, request caching, rate limiting, database indexing optimization

**Medium-term**: Email notifications, pagination, PDF upload to S3 from backend

**Long-term**: Multi-tenancy, advanced features, performance optimization

## Trade-offs

**Simplicity vs Scalability**: Chose PostgreSQL for production-readiness, Docker for local development simplicity

**Type Safety vs Speed**: Chose comprehensive TypeScript, fewer runtime errors

**Features vs Time**: Focused on core features with high quality, skipped optional enhancements
