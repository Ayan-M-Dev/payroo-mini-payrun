import app from "./app";
import dotenv from "dotenv";
import prisma from "./lib/db";
import logger from "./lib/logger";

dotenv.config();

const port = process.env.PORT || 4000;

const server = app.listen(port, () => {
  logger.info({ port, msg: "Server started" });
});

process.on("SIGTERM", async () => {
  logger.info({ msg: "SIGTERM signal received: closing HTTP server" });
  server.close(() => {
    logger.info({ msg: "HTTP server closed" });
  });
  await prisma.$disconnect();
});

process.on("SIGINT", async () => {
  logger.info({ msg: "SIGINT signal received: closing HTTP server" });
  server.close(() => {
    logger.info({ msg: "HTTP server closed" });
  });
  await prisma.$disconnect();
});
