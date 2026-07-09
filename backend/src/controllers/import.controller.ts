import { Request, Response, NextFunction } from 'express';
import { runImport } from '../services/import.service.js';
import { AppError } from '../middlewares/errorHandler.js';
import { logger } from '../utils/logger.js';
import * as fs from 'fs';

export async function handleImport(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  if (!req.file) {
    next(new AppError(400, 'No CSV file provided'));
    return;
  }

  const filePath = req.file.path;
  try {
    const result = await runImport(filePath, req.file.originalname);
    res.status(200).json(result);
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    logger.error({ err: error.message }, 'Import handler error');
    next(err);
  } finally {
    fs.unlink(filePath, (unlinkErr) => {
      if (unlinkErr) {
        logger.error({ filePath, error: unlinkErr.message }, 'Failed to delete temp uploaded file');
      } else {
        logger.debug({ filePath }, 'Temporary uploaded file cleaned up');
      }
    });
  }
}
