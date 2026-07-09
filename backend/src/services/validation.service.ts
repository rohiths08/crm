import { BatchResponseSchema, validateRecord, repairMappings, type BatchResponse } from '../schemas/crm.schema.js';
import { CrmRecord, SkippedRecord } from '../types/index.js';
import { logger } from '../utils/logger.js';

function yieldToEventLoop(): Promise<void> {
  return new Promise((resolve) => setImmediate(resolve));
}

/**
 * Validate an entire batch response from AI.
 * Returns repaired records, skipped records, and validated column mappings.
 */
export async function validateBatchResponse(
  rawResponse: unknown,
  csvHeaders: string[],
  importId: string,
  batchNumber: number,
): Promise<{
  records: CrmRecord[];
  skipped: SkippedRecord[];
  columnMappings: Record<string, string>;
}> {
  // Validate the overall structure
  const parsed = BatchResponseSchema.safeParse(rawResponse);

  if (!parsed.success) {
    const errors = parsed.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ');
    logger.warn(
      { importId, batchNumber, errors },
      'Batch response failed schema validation',
    );
    return { records: [], skipped: [], columnMappings: {} };
  }

  const data = parsed.data;

  // Validate and repair individual records
  const records: CrmRecord[] = [];
  const skipped: SkippedRecord[] = [];

  for (let i = 0; i < data.records.length; i++) {
    // Yield to event loop every 5 records to prevent blocking
    if (i > 0 && i % 5 === 0) {
      await yieldToEventLoop();
    }

    const raw = data.records[i];
    const validation = validateRecord(raw);

    if (validation.valid && validation.repaired) {
      const repaired = validation.repaired;
      const hasEmail = repaired.email && repaired.email.trim().length > 0;
      const hasMobile = repaired.mobile_without_country_code && repaired.mobile_without_country_code.trim().length > 0;

      if (!hasEmail && !hasMobile) {
        logger.debug(
          { importId, batchNumber, recordIndex: i },
          'Record lacks both email and mobile number, adding to skipped',
        );
        skipped.push({
          originalRow: [],
          reason: 'Validation failed: Record contains neither email nor mobile number',
          preview: {
            name: repaired.name || '',
            company: repaired.company || '',
          },
        });
      } else {
        records.push(repaired);
      }
    } else {
      logger.debug(
        { importId, batchNumber, recordIndex: i, error: validation.error },
        'Record failed validation, adding to skipped',
      );
      skipped.push({
        originalRow: [],
        reason: validation.error ?? 'Validation failed',
        preview: {},
      });
    }
  }

  // Include AI-skipped records
  skipped.push(...data.skipped);

  // Repair column mappings against actual CSV headers
  const columnMappings = repairMappings(data.columnMappings, csvHeaders);

  return { records, skipped, columnMappings };
}
