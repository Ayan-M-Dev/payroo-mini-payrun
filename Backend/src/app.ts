import express from "express";
import cors from "cors";
import helmet from "helmet";
import { authMiddleware } from "./lib/auth";
import { errorHandler } from "./lib/errorHandler";
import { requestIdMiddleware } from "./lib/requestId";
import authRouter from "./routes/auth";
import employeesRouter from "./routes/employees";
import timesheetsRouter from "./routes/timesheets";
import payrunsRouter from "./routes/payruns";
import payslipsRouter from "./routes/payslips";

const app = express();

app.use(helmet());
app.use(cors());
app.use(requestIdMiddleware);
app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/auth", authRouter);
app.use(authMiddleware);

app.use("/employees", employeesRouter);
app.use("/timesheets", timesheetsRouter);
app.use("/payruns", payrunsRouter);
app.use("/payslips", payslipsRouter);

app.use(errorHandler);

export default app;
