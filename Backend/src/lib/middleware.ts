import { Request, Response, NextFunction } from "express";
import { z, ZodError } from "zod";

export function validateBody<T>(schema: z.ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.issues.map((err) => ({
          path: err.path.join("."),
          message: err.message,
        }));

        res.status(400).json({
          error: "Validation error",
          details: errors,
        });
      } else {
        res.status(500).json({
          error: "Internal server error",
        });
      }
    }
  };
}

export function validateQuery<T>(schema: z.ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.query = schema.parse(req.query) as Record<string, string>;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.issues.map((err) => ({
          path: err.path.join("."),
          message: err.message,
        }));

        res.status(400).json({
          error: "Validation error",
          details: errors,
        });
      } else {
        res.status(500).json({
          error: "Internal server error",
        });
      }
    }
  };
}

export function validateParams<T>(schema: z.ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.params = schema.parse(req.params) as Record<string, string>;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.issues.map((err) => ({
          path: err.path.join("."),
          message: err.message,
        }));

        res.status(400).json({
          error: "Validation error",
          details: errors,
        });
      } else {
        res.status(500).json({
          error: "Internal server error",
        });
      }
    }
  };
}
