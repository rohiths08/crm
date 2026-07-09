import app from './app.js';
import { config } from './config/index.js';
import { logger } from './utils/logger.js';
import { activeImportsCount } from './services/import.service.js';

const server = app.listen(config.port, () => {
  logger.info({ port: config.port, env: config.nodeEnv }, 'Server started');
});

const shutdown = (signal: string) => {
  logger.info({ signal, activeImports: activeImportsCount }, 'Shutdown signal received');

  // Stop accepting new connections
  server.close(() => {
    logger.info('HTTP server closed');
  });

  const gracePeriodMs = 30000; // 30 seconds grace period
  const start = Date.now();

  const checkActiveImports = () => {
    if (activeImportsCount === 0) {
      logger.info('No active imports remaining. Exiting cleanly.');
      process.exit(0);
    }

    const elapsed = Date.now() - start;
    if (elapsed >= gracePeriodMs) {
      logger.warn(
        { activeImports: activeImportsCount },
        'Forcefully shutting down because active imports did not finish within the grace period',
      );
      process.exit(1);
    }

    logger.info(
      { activeImports: activeImportsCount, timeRemainingMs: gracePeriodMs - elapsed },
      'Waiting for active imports to finish...',
    );
    setTimeout(checkActiveImports, 1000);
  };

  checkActiveImports();
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
