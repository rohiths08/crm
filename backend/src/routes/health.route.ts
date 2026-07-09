import { Router, Request, Response } from 'express';
import { config } from '../config/index.js';

const router = Router();

router.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    version: '1.0.0',
    uptime: process.uptime(),
    geminiConfigured: Boolean(config.gemini.apiKey),
  });
});

router.get('/version', (_req: Request, res: Response) => {
  res.json({ version: '1.0.0' });
});

export default router;
