import { parse } from 'csv-parse';
import * as fs from 'fs';
import { CsvRow, NormalizedRow } from '../types/index.js';
import { normalizeHeaders, normalizeRow } from './mapping.service.js';
import { logger } from '../utils/logger.js';

export interface ParseResult {
  headers: string[];
  originalHeaders: string[];
  rows: NormalizedRow[];
  rowCount: number;
  parseDurationMs: number;
}

// Delimiter detection is kept untouched// Detect delimiter by sampling the first few lines
export function detectDelimiter(sample: string): string {
  const lines = sample
    .split(/\r?\n/)
    .filter((l) => l.length > 0)
    .slice(0, 5);
  if (lines.length === 0) return ',';

  const candidates = [',', '\t', ';', '|'];
  let bestDelimiter = ',';
  let bestScore = 0;

  for (const delimiter of candidates) {
    const counts = lines.map((line) => {
      let count = 0;
      let inQuote = false;
      for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') {
          inQuote = !inQuote;
        } else if (ch === delimiter && !inQuote) {
          count++;
        }
      }
      return count;
    });

    // All non-empty lines should have the same delimiter count (consistency)
    const unique = new Set(counts);
    if (unique.size === 1 && counts[0] > 0) {
      // Perfect consistency — strong signal
      if (counts[0] > bestScore) {
        bestScore = counts[0];
        bestDelimiter = delimiter;
      }
    }
  }

  return bestDelimiter;
}

export async function* streamCsvRows(
  filePath: string,
  importId?: string,
): AsyncGenerator<{
  row: NormalizedRow;
  originalHeaders: string[];
  normalizedHeaders: string[];
  delimiter: string;
  totalParsedRowsSoFar: number;
}> {
  // 1. Detect delimiter from a string sample
  const buffer = Buffer.alloc(4096);
  const fd = fs.openSync(filePath, 'r');
  const bytesRead = fs.readSync(fd, buffer, 0, 4096, 0);
  fs.closeSync(fd);
  
  const sample = buffer.toString('utf-8', 0, bytesRead);
  const delimiter = detectDelimiter(sample);
  logger.debug({ importId, delimiter }, 'Delimiter detected for stream');

  // 2. Parse with csv-parse streaming
  const stream = fs.createReadStream(filePath);
  const parser = parse({
    columns: true,
    delimiter,
    skip_empty_lines: true,
    trim: true,
    relax_column_count: true,
    relax_quotes: true,
    bom: true, // csv-parse will automatically strip BOM
    comment: '', // No comment character
  });

  stream.pipe(parser);

  let originalHeaders: string[] = [];
  let normalizedHeaders: string[] = [];
  let rowCount = 0;

  try {
    for await (const record of parser) {
      if (originalHeaders.length === 0) {
        originalHeaders = Object.keys(record);
        normalizedHeaders = normalizeHeaders(originalHeaders);
      }
      rowCount++;
      const row = normalizeRow(record, originalHeaders, normalizedHeaders);
      yield {
        row,
        originalHeaders,
        normalizedHeaders,
        delimiter,
        totalParsedRowsSoFar: rowCount,
      };
    }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    logger.error({ importId, error: errorMsg }, 'CSV stream parsing error');
    throw new Error(`CSV parse error: ${errorMsg}`);
  }
}

export async function parseCsv(filePath: string, importId?: string): Promise<ParseResult> {
  const startTime = Date.now();
  const rows: NormalizedRow[] = [];
  let originalHeaders: string[] = [];
  let headers: string[] = [];
  let delimiter = ',';

  for await (const chunk of streamCsvRows(filePath, importId)) {
    rows.push(chunk.row);
    originalHeaders = chunk.originalHeaders;
    headers = chunk.normalizedHeaders;
    delimiter = chunk.delimiter;
  }

  const parseDurationMs = Date.now() - startTime;

  if (rows.length === 0) {
    logger.warn({ importId, parseDurationMs }, 'CSV parsed with zero records');
    return { headers: [], originalHeaders: [], rows: [], rowCount: 0, parseDurationMs };
  }

  logger.info(
    {
      importId,
      rowCount: rows.length,
      columnCount: originalHeaders.length,
      originalHeaders,
      normalizedHeaders: headers,
      delimiter,
      parseDurationMs,
    },
    'CSV parsed successfully via stream helper',
  );

  return { headers, originalHeaders, rows, rowCount: rows.length, parseDurationMs };
}
