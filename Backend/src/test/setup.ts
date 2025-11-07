import dotenv from "dotenv";

dotenv.config();

// Use PostgreSQL for tests - always override DATABASE_URL for tests
// For local: use docker-compose database, for CI: use test database
process.env.DATABASE_URL = process.env.CI
  ? "postgresql://test:test@localhost:5432/test"
  : "postgresql://payrooAdmin:payrooPassword123@localhost:5432/payroo";
process.env.DATABASE_PROVIDER = "postgresql";
