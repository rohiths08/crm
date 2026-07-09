import { ImportResponse, CrmRecord, SkippedRecord } from '../types/index.js';
import { streamCsvRows } from './csv.service.js';
import { globalLimit } from './batch.service.js';
import { processBatch, AiBatchResponse } from './ai.service.js';
import { executeWithRetry } from './retry.service.js';
import { computeConfidence } from './confidence.service.js';
import { PROMPT_VERSION } from '../prompts/versions.js';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';
import { randomUUID } from 'crypto';
import { AppError } from '../middlewares/errorHandler.js';

export let activeImportsCount = 0;

export async function runImport(filePath: string, fileName: string): Promise<ImportResponse> {
  activeImportsCount++;
  const importId = randomUUID();
  const startedAt = new Date();
  const startTime = Date.now();

  logger.info({ importId, fileName }, 'Import started');

  let originalHeaders: string[] = [];
  let normalizedHeaders: string[] = [];
  let delimiter = ',';
  let totalRows = 0;

  const promises: Promise<AiBatchResponse>[] = [];
  const activePromises = new Set<Promise<any>>();

  let batchRows: any[] = [];
  let batchIndex = 0;
  let parsedAny = false;

  const processor = async (batch: { index: number; rows: any[]; headers: string[] }) => {
    try {
      return await executeWithRetry(
        () => processBatch(batch.rows, batch.headers, importId, batch.index),
        { importId, batchNumber: batch.index },
      );
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      logger.error({ importId, batchNumber: batch.index, error: errorMsg }, 'Batch failed permanently');

      // Return error result instead of crashing
      return {
        columnMappings: {},
        records: [] as CrmRecord[],
        skipped: batch.rows.map((r) => ({
          originalRow: Object.values(r.raw) as string[],
          reason: `AI processing failed: ${errorMsg}`,
          preview: Object.fromEntries(Object.entries(r.normalized).slice(0, 5)) as Record<string, string>,
        })),
      };
    }
  };

  try {
    for await (const chunk of streamCsvRows(filePath, importId)) {
      parsedAny = true;
      if (originalHeaders.length === 0) {
        originalHeaders = chunk.originalHeaders;
        normalizedHeaders = chunk.normalizedHeaders;
        delimiter = chunk.delimiter;
      }
      totalRows = chunk.totalParsedRowsSoFar;
      batchRows.push(chunk.row);

      if (batchRows.length === config.batch.size) {
        const currentBatchRows = batchRows;
        const currentBatchIndex = batchIndex++;
        batchRows = [];

        const jobPromise = globalLimit(() =>
          processor({
            index: currentBatchIndex,
            rows: currentBatchRows,
            headers: normalizedHeaders,
          }),
        ).finally(() => {
          activePromises.delete(jobPromise);
        });

        activePromises.add(jobPromise);
        promises.push(jobPromise);

        // Backpressure: pause parsing if queue is saturated
        if (activePromises.size >= config.batch.concurrency * 2) {
          await Promise.race(activePromises);
        }
      }
    }

    // Process remaining rows in last batch
    if (batchRows.length > 0) {
      const currentBatchIndex = batchIndex++;
      const jobPromise = globalLimit(() =>
        processor({
          index: currentBatchIndex,
          rows: batchRows,
          headers: normalizedHeaders,
        }),
      ).finally(() => {
        activePromises.delete(jobPromise);
      });

      activePromises.add(jobPromise);
      promises.push(jobPromise);
    }

    if (!parsedAny) {
      throw new AppError(400, 'CSV file is empty or contains no data rows');
    }

    if (normalizedHeaders.length === 0) {
      throw new AppError(400, 'CSV file has no recognizable columns');
    }

    logger.info(
      { importId, totalBatches: promises.length, batchSize: config.batch.size, totalRows },
      'CSV stream parsing complete, awaiting remaining batch executions',
    );

    // Wait for all batches to settle
    const batchResults = await Promise.all(promises);

    // 4. Aggregate results
    const allRecords: CrmRecord[] = [];
    const allSkipped: SkippedRecord[] = [];
    const allColumnMappings: Record<string, string> = {};

    for (const result of batchResults) {
      for (const record of result.records) {
        record.processing_confidence = computeConfidence(record as any);
        allRecords.push(record);
      }
      allSkipped.push(...result.skipped);
      Object.assign(allColumnMappings, result.columnMappings);
    }

    const durationMs = Date.now() - startTime;
    const finishedAt = new Date();
    const avgConfidence =
      allRecords.length > 0
        ? allRecords.reduce((s, r) => s + r.processing_confidence, 0) / allRecords.length
        : 0;

    logger.info(
      {
        importId,
        totalRows,
        imported: allRecords.length,
        skipped: allSkipped.length,
        processingTime: formatDuration(durationMs),
        averageConfidence: Math.round(avgConfidence * 100) / 100,
      },
      'Import finished',
    );

    return {
      success: true,
      data: {
        summary: {
          totalRows,
          imported: allRecords.length,
          skipped: allSkipped.length,
          processingTime: formatDuration(durationMs),
          averageConfidence: Math.round(avgConfidence * 100) / 100,
        },
        metadata: {
          importId,
          model: config.gemini.model,
          promptVersion: PROMPT_VERSION,
          batchSize: config.batch.size,
          totalBatches: promises.length,
          durationMs,
          startedAt: startedAt.toISOString(),
          finishedAt: finishedAt.toISOString(),
          processingConfidence: Math.round(avgConfidence * 100) / 100,
        },
        columnMappings: allColumnMappings,
        records: allRecords,
        skipped: allSkipped,
      },
    };
  } finally {
    activeImportsCount--;
  }
}

function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (minutes > 0) return `${minutes}m ${remainingSeconds}s`;
  return `${remainingSeconds}s`;
}
