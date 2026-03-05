import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { logger } from "../../config/logger";
import { issue } from "zod/v4/core/util.cjs";

export class AppError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number = 500
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super(message, 404);
    this.name = "NotFoundError";
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden") {
    super(message, 403);
    this.name = "ForbiddenError";
  }
}

export class ConflictError extends AppError {
  constructor(message = "Conflict") {
    super(message, 409);
    this.name = "ConflictError";
  }
}

export class BadRequestError extends AppError {
  constructor(message = "Bad request") {
    super(message, 400);
    this.name = "BadRequestError";
  }
}

/**
 * Maps known service-layer error messages to proper HTTP errors.
 * Bridges the gap until services throw typed errors directly.
 */
function mapServiceError(err: Error): AppError | null {
  const msg = err.message;

  const notFound = ["Board not found"];
  const forbidden = [
    "Unauthorized access to board",
    "Only owner can change board visibility",
    "Only owner can add collaborators",
    "Only owner can remove collaborators",
  ];
  const conflict = ["User is already a collaborator", "Owner is already a collaborator"];
  const badRequest = [/Invalid nodeId reference/];

  if (notFound.includes(msg)) return new NotFoundError(msg);
  if (forbidden.includes(msg)) return new ForbiddenError(msg);
  if (conflict.includes(msg)) return new ConflictError(msg);
  if (badRequest.some((p) => (typeof p === "string" ? p === msg : p.test(msg))))
    return new BadRequestError(msg);

  return null;
}

export function errorMiddleware(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof ZodError) {
    logger.warn(`[validation error] ${req.method} ${req.path}`, {issues: err.issues});
    res.status(400).json({ error: "Validation error", details: err.issues });
    return;
  }

  if (err instanceof AppError) {
    logger.warn(`[${err.name}] ${req.method} ${req.path}: ${err.message}`);
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  // Attempt to map known service-layer string errors
  const mapped = mapServiceError(err);
  if (mapped) {
    logger.warn(`[${mapped.name}] ${req.method} ${req.path}: ${mapped.message}`);
    res.status(mapped.statusCode).json({ error: mapped.message });
    return;
  }

  logger.error(`[unhandled error] ${req.method} ${req.path}: ${err.message}`, { error: err });
  res.status(500).json({
    error: "Internal server error",
    message: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
}
