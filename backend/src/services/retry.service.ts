import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';

/**
 * Execute an async function with configurable retry and exponential backoff.
 *
 * - Retries on: network errors, 5xx responses, timeouts
 * - Does NOT retry on: 4xx client errors, validation failures
 * - Logs each retry attempt with importId and batchNumber
 */
export async function executeWithRetry<T>(
  fn: () => Promise<T>,
  context: { importId: string; batchNumber: number },
): Promise<T> {
  const maxAttempts = config.batch.maxRetries + 1;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const result = await fn();
      if (attempt > 1) {
        logger.info(
          {
            importId: context.importId,
            batchNumber: context.batchNumber,
            attempt,
            totalAttempts: maxAttempts,
          },
          'Batch succeeded after retry',
        );
      }
      return result;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));

      // Don't retry on client errors (4xx) — they won't succeed on retry
      if (isClientError(lastError)) {
        logger.warn(
          {
            importId: context.importId,
            batchNumber: context.batchNumber,
            attempt,
            error: lastError.message,
          },
          'Non-retryable client error, skipping retries',
        );
        throw lastError;
      }

      if (attempt < maxAttempts) {
        const delayMs = 1000 * Math.pow(2, attempt - 1); // exponential backoff: 1s, 2s, 4s...
        logger.warn(
          {
            importId: context.importId,
            batchNumber: context.batchNumber,
            attempt,
            maxAttempts,
            delayMs,
            error: lastError.message,
          },
          'Batch retry',
        );
        await sleep(delayMs);
      }
    }
  }

  logger.error(
    {
      importId: context.importId,
      batchNumber: context.batchNumber,
      attempts: maxAttempts,
      error: lastError?.message,
    },
    'Batch failed after all retry attempts',
  );

  throw lastError;
}

function isClientError(err: Error): boolean {
  const msg = err.message.toLowerCase();

  // Rate limits and timeouts are explicitly retryable
  if (
    msg.includes('429') ||
    msg.includes('resource_exhausted') ||
    msg.includes('rate_limit') ||
    msg.includes('timeout') ||
    msg.includes('abort')
  ) {
    return false;
  }

  // Common gRPC / Google API client errors that are non-retryable
  const clientErrors = [
    'invalid_argument',
    'failed_precondition',
    'permission_denied',
    'unauthenticated',
    'not_found',
    'already_exists',
  ];

  if (clientErrors.some((status) => msg.includes(`"status":"${status}"`) || msg.includes(`status: ${status}`) || msg.includes(status))) {
    return true;
  }

  // Check HTTP status code if available on the error object
  const status = (err as any).status || (err as any).statusCode || (err as any).status_code;
  if (typeof status === 'number') {
    // 429 and 408 are retryable. 4xx other than those are non-retryable client errors.
    if (status === 429 || status === 408) {
      return false;
    }
    return status >= 400 && status < 500;
  }

  return false;
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
