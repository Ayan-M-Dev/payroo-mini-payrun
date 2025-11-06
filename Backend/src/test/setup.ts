import dotenv from "dotenv";

dotenv.config();

process.env.DATABASE_URL =
  process.env.DATABASE_URL?.replace("dev.db", "test.db") ||
  "file:./prisma/test.db";
