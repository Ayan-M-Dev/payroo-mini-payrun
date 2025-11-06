import { Request, Response, NextFunction } from "express";
import logger from "./logger";

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export function errorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  const reqId = req.reqId || "no-req-id";

  if (err instanceof AppError) {
    logger.warn({
      reqId,
      statusCode: err.statusCode,
      error: err.message,
      msg: "Request error",
    });
    return res.status(err.statusCode).json({
      error: err.message,
    });
  }

  logger.error({
    reqId,
    err: {
      name: err.name,
      message: err.message,
      stack: err.stack,
    },
    msg: "Unexpected error",
  });

  res.status(500).json({
    error: "Internal server error",
    message: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
}

export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
