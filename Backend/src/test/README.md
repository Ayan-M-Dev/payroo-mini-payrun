# API Integration Tests

This directory contains API integration tests for the Payroo Mini Payrun backend.

## Test Structure

- `setup.ts` - Test environment configuration
- `helpers.ts` - Test utility functions
- `api.test.ts` - Main API integration tests

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Test Coverage

The tests cover:

### Happy Path Tests

- ✅ Health check endpoint
- ✅ Employee CRUD operations
- ✅ Timesheet creation
- ✅ Payrun generation
- ✅ Payslip retrieval

### Validation Error Tests

- ✅ Missing required fields
- ✅ Invalid data types
- ✅ Invalid date formats
- ✅ Invalid time formats
- ✅ Business rule violations (e.g., periodEnd before periodStart)

### Authentication Tests

- ✅ Missing Authorization header
- ✅ Empty Bearer token
- ✅ Valid Bearer token acceptance

### Error Handling Tests

- ✅ 404 errors for non-existent resources
- ✅ 400 errors for validation failures
- ✅ 401 errors for authentication failures

## Test Database

Tests use a separate test database (`test.db`) to avoid affecting development data.

The test database is automatically cleaned before and after test runs.
