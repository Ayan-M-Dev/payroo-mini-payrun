import { Request, Response, NextFunction } from "express";
import { randomUUID } from "crypto";
import logger from "./logger";

declare module "express-serve-static-core" {
  interface Request {
    reqId?: string;
  }
}

export function requestIdMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const reqId = randomUUID();
  req.reqId = reqId;

  res.setHeader("X-Request-Id", reqId);

  logger.info({
    reqId,
    method: req.method,
    url: req.url,
    msg: "Request started",
  });

  next();
}

export function getLogger(req: Request) {
  return logger.child({ reqId: req.reqId || "no-req-id" });
}
