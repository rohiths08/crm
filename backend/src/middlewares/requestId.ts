import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

declare global {
  namespace Express {
    interface Request {
      id?: string;
    }
  }
}

export function requestId(req: Request, res: Response, next: NextFunction): void {
  const reqId = (req.header('X-Request-ID') || randomUUID());
  req.id = reqId;
  res.setHeader('X-Request-ID', reqId);
  next();
}
