import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import multer from 'multer';
import { logger } from '../utils/logger.js';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public isOperational = true,
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  // AppError — operational errors (bad input, missing file, etc.)
  if (err instanceof AppError) {
    logger.warn({ statusCode: err.statusCode, message: err.message }, 'Operational error');
    res.status(err.statusCode).json({ success: false, error: err.message });
    return;
  }

  // Multer errors — file upload issues
  if (err instanceof multer.MulterError) {
    const statusCode = err.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
    const message =
      err.code === 'LIMIT_FILE_SIZE'
        ? 'File too large. Maximum size is 10MB.'
        : `Upload error: ${err.message}`;
    logger.warn({ multerCode: err.code, message }, 'Multer error');
    res.status(statusCode).json({ success: false, error: message });
    return;
  }

  // Zod errors — schema validation
  if (err instanceof ZodError) {
    const message = err.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ');
    logger.warn({ errors: err.errors }, 'Validation error');
    res.status(400).json({ success: false, error: `Validation failed: ${message}` });
    return;
  }

  // Unexpected errors
  logger.error({ err: { message: err.message, stack: err.stack } }, 'Unexpected error');
  res.status(500).json({ success: false, error: 'Internal server error' });
}
