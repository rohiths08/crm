import { Batch, BatchResult } from '../types/index.js';
import { config } from '../config/index.js';
import { NormalizedRow } from '../types/index.js';
import { logger } from '../utils/logger.js';

/**
 * Split rows into batches of configured size.
 */
export function createBatches(rows: NormalizedRow[], headers: string[]): Batch[] {
  const batchSize = config.batch.size;
  const batches: Batch[] = [];

  for (let i = 0; i < rows.length; i += batchSize) {
    batches.push({
      index: batches.length,
      rows: rows.slice(i, i + batchSize),
      headers,
    });
  }

  return batches;
}

import pLimit from 'p-limit';

export const globalLimit = pLimit(config.batch.concurrency);

/**
 * Process batches with configurable global concurrency.
 * Results maintain batch order (indexed by batch.index).
 */
export async function processBatchesConcurrently<T>(
  batches: Batch[],
  processor: (batch: Batch) => Promise<T>,
  importId: string,
): Promise<T[]> {
  logger.info(
    { importId, totalBatches: batches.length, globalConcurrency: config.batch.concurrency },
    'Starting globally constrained concurrent batch processing',
  );

  const promises = batches.map((batch) =>
    globalLimit(async () => {
      try {
        return await processor(batch);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        logger.error(
          { importId, batchNumber: batch.index, error: errorMsg },
          'Batch processing error in worker',
        );
        throw err;
      }
    }),
  );

  const settled = await Promise.allSettled(promises);
  const results: T[] = new Array(batches.length);

  for (let i = 0; i < settled.length; i++) {
    const result = settled[i];
    if (result.status === 'fulfilled') {
      results[i] = result.value;
    } else {
      // Re-throw or handle depending on requirements. 
      // Handled by the caller (import.service.ts)
      throw result.reason;
    }
  }

  return results;
}
