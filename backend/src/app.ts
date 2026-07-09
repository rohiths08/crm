import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './config/index.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { requestId } from './middlewares/requestId.js';
import { logger } from './utils/logger.js';
import routes from './routes/index.js';

const app = express();

app.use(requestId);

// HTTP Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  logger.info({ reqId: req.id, method: req.method, url: req.url }, 'Incoming request');
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(
      { reqId: req.id, method: req.method, url: req.url, status: res.statusCode, durationMs: duration },
      'Request completed',
    );
  });
  next();
});

app.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(routes);
app.use('/api/backend', routes);
app.use(errorHandler);

export default app;
