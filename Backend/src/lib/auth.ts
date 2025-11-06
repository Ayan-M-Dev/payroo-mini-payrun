import { Request, Response, NextFunction } from "express";
import { verifyToken, isJWT } from "./jwt";

declare module "express-serve-static-core" {
  interface Request {
    user?: {
      userId: string;
      email?: string;
    };
  }
}

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "Unauthorized",
      message: "Bearer token required",
    });
  }

  const token = authHeader.substring(7);

  if (!token || token.trim().length === 0) {
    return res.status(401).json({
      error: "Unauthorized",
      message: "Token cannot be empty",
    });
  }

  if (isJWT(token)) {
    try {
      const decoded = verifyToken(token);
      req.user = {
        userId: decoded.userId,
        email: decoded.email,
      };
      return next();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Invalid token";
      return res.status(401).json({
        error: "Unauthorized",
        message,
      });
    }
  }

  next();
}
