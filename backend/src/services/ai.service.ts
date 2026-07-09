import { GoogleGenAI } from '@google/genai';
import { Groq } from 'groq-sdk';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';
import { PromptService } from '../prompts/index.js';
import { NormalizedRow, CrmRecord, SkippedRecord } from '../types/index.js';
import { validateBatchResponse } from './validation.service.js';

const promptService = new PromptService();

export interface AiBatchResponse {
  columnMappings: Record<string, string>;
  records: CrmRecord[];
  skipped: SkippedRecord[];
}

/**
 * Process a single batch of rows through Gemini AI.
 * Returns parsed CRM records, column mappings, and skipped rows.
 */
export async function processBatch(
  rows: NormalizedRow[],
  headers: string[],
  importId: string,
  batchNumber: number,
): Promise<AiBatchResponse> {
  const genAI = new GoogleGenAI({ apiKey: config.gemini.apiKey });
  const prompt = promptService.buildBatchPrompt(rows, headers);
  const startTime = Date.now();

  logger.debug(
    {
      importId,
      batchNumber,
      promptVersion: promptService.getVersion(),
      model: promptService.getModel(),
      rowCount: rows.length,
      promptLength: prompt.length,
    },
    'Sending batch to Gemini',
  );

  let text = '';
  let usedModel = promptService.getModel();

  const geminiController = new AbortController();
  const geminiTimeout = setTimeout(() => {
    geminiController.abort();
  }, config.gemini.timeoutMs);

  try {
    const response = await genAI.models.generateContent({
      model: promptService.getModel(),
      contents: prompt,
      config: {
        abortSignal: geminiController.signal,
      },
    });
    text = response.text ?? '';
  } catch (error) {
    const isAbort = error instanceof Error && (error.name === 'AbortError' || error.message.includes('aborted') || error.message.includes('cancel'));
    const errorMsg = isAbort
      ? `Gemini request timed out after ${config.gemini.timeoutMs}ms`
      : (error instanceof Error ? error.message : String(error));
    
    if (!config.groq.apiKey) {
      logger.error({ importId, batchNumber, error: errorMsg }, 'Gemini API failed and no Groq fallback API key configured');
      throw new Error(errorMsg);
    }

    logger.warn(
      { importId, batchNumber, error: errorMsg },
      'Gemini API failed, attempting Groq fallback'
    );

    usedModel = config.groq.model;
    const groq = new Groq({ apiKey: config.groq.apiKey });
    
    const groqController = new AbortController();
    const groqTimeout = setTimeout(() => {
      groqController.abort();
    }, config.gemini.timeoutMs);

    try {
      const groqResponse = await groq.chat.completions.create(
        {
          messages: [{ role: 'user', content: prompt }],
          model: config.groq.model,
        },
        {
          signal: groqController.signal,
        }
      );

      text = groqResponse.choices?.[0]?.message?.content ?? '';
    } catch (groqError) {
      const isGroqAbort = groqError instanceof Error && (groqError.name === 'AbortError' || groqError.message.includes('aborted') || groqError.message.includes('cancel'));
      const groqErrorMsg = isGroqAbort
        ? `Groq request timed out after ${config.gemini.timeoutMs}ms`
        : (groqError instanceof Error ? groqError.message : String(groqError));
      logger.error({ importId, batchNumber, error: groqErrorMsg }, 'Groq fallback failed');
      throw new Error(groqErrorMsg);
    } finally {
      clearTimeout(groqTimeout);
    }
  } finally {
    clearTimeout(geminiTimeout);
  }

  const durationMs = Date.now() - startTime;

  logger.debug(
    { importId, batchNumber, durationMs, responseLength: text.length, usedModel },
    'AI response received',
  );

  // Strip markdown code fences if present
  const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();

  if (!cleaned) {
    logger.error({ importId, batchNumber, text }, 'Empty AI response');
    return { columnMappings: {}, records: [], skipped: [] };
  }

  // Parse JSON
  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch (parseError) {
    const msg = parseError instanceof Error ? parseError.message : String(parseError);
    logger.error(
      { importId, batchNumber, error: msg, textPreview: text.slice(0, 1000) },
      'Failed to parse AI response as JSON',
    );
    return { columnMappings: {}, records: [], skipped: [] };
  }

  // Validate and repair using Zod schemas
  const validated = await validateBatchResponse(parsed, headers, importId, batchNumber);

  logger.info(
    {
      importId,
      batchNumber,
      recordsCount: validated.records.length,
      skippedCount: validated.skipped.length,
      mappingsCount: Object.keys(validated.columnMappings).length,
      durationMs,
    },
    'Batch processed successfully',
  );

  return validated;
}
