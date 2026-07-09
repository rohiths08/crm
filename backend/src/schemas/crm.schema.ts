import { z } from 'zod';
import { CRM_STATUSES, DATA_SOURCES } from '../types/index.js';

// ─── CRM Record Schema ────────────────────────────────────────────────────
// Validates a single AI-extracted CRM record with repair logic.

const CrmRecordSchema = z.object({
  created_at: z.coerce.string().catch(''),
  name: z.coerce.string().catch(''),
  email: z.coerce.string().catch(''),
  country_code: z.coerce.string().catch(''),
  mobile_without_country_code: z.coerce.string().catch(''),
  company: z.coerce.string().catch(''),
  city: z.coerce.string().catch(''),
  state: z.coerce.string().catch(''),
  country: z.coerce.string().catch(''),
  lead_owner: z.coerce.string().catch(''),
  crm_status: z.enum(CRM_STATUSES).catch('GOOD_LEAD_FOLLOW_UP'),
  crm_note: z.coerce.string().catch(''),
  data_source: z.enum(DATA_SOURCES).catch(''),
  possession_time: z.coerce.string().catch(''),
  description: z.coerce.string().catch(''),
  processing_confidence: z.coerce.number().min(0).max(1).catch(0),
});

export type ValidatedCrmRecord = z.infer<typeof CrmRecordSchema>;

// ─── Skipped Record Schema ────────────────────────────────────────────────

const SkippedRecordSchema = z.object({
  originalRow: z.array(z.string()),
  reason: z.string(),
  preview: z.record(z.string(), z.string()),
});

export type ValidatedSkippedRecord = z.infer<typeof SkippedRecordSchema>;

// ─── Column Mappings Schema ───────────────────────────────────────────────

const ColumnMappingsSchema = z.record(z.string(), z.string());

// ─── Batch Response Schema ────────────────────────────────────────────────
// Validates the entire AI response structure for a single batch.

export const BatchResponseSchema = z.object({
  columnMappings: ColumnMappingsSchema.default({}),
  records: z.array(CrmRecordSchema).default([]),
  skipped: z.array(SkippedRecordSchema).default([]),
});

export type BatchResponse = z.infer<typeof BatchResponseSchema>;

// ─── Validation Result ────────────────────────────────────────────────────

export interface ValidationResult {
  valid: boolean;
  repaired?: ValidatedCrmRecord;
  error?: string;
}

// ─── Validate and Repair ──────────────────────────────────────────────────

/**
 * Validate a single record using Zod. Attempts repair for common issues:
 * - Missing strings → empty string
 * - Invalid crmStatus → default to GOOD_LEAD_FOLLOW_UP
 * - Invalid dataSource → default to Other
 * - Null/undefined fields → defaults
 */
export function validateRecord(record: unknown): ValidationResult {
  const result = CrmRecordSchema.safeParse(record);

  if (result.success) {
    return { valid: true, repaired: result.data };
  }

  const errorMessages = result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ');
  return { valid: false, error: `Validation failed: ${errorMessages}` };
}

// ─── Helper Functions ─────────────────────────────────────────────────────

function toStringSafe(value: unknown): string {
  if (value === null || value === undefined) return '';
  return String(value).trim();
}

function toNumberSafe(value: unknown): number {
  if (typeof value === 'number') return Math.max(0, Math.min(1, value));
  if (typeof value === 'string') {
    const n = parseFloat(value);
    if (!isNaN(n)) return Math.max(0, Math.min(1, n));
  }
  return 0;
}

function toValidCrmStatus(value: unknown): string {
  const str = String(value ?? '').trim();
  if ((CRM_STATUSES as readonly string[]).includes(str)) return str;
  return 'GOOD_LEAD_FOLLOW_UP';
}

function toValidDataSource(value: unknown): string {
  const str = String(value ?? '').trim();
  if ((DATA_SOURCES as readonly string[]).includes(str)) return str;
  return '';
}

// ─── Repair Column Mappings ───────────────────────────────────────────────

/**
 * Validate AI-provided column mappings against actual CSV headers.
 * Removes mappings to non-existent headers.
 * Adds default mappings for clearly-named headers not covered by AI.
 */
export function repairMappings(
  aiMappings: Record<string, string>,
  csvHeaders: string[],
): Record<string, string> {
  const repaired: Record<string, string> = {};
  const headerSet = new Set(csvHeaders.map((h) => h.toLowerCase()));

  // Keep only valid mappings
  for (const [csvCol, crmField] of Object.entries(aiMappings)) {
    if (headerSet.has(csvCol.toLowerCase()) && typeof crmField === 'string' && crmField.length > 0) {
      repaired[csvCol] = crmField;
    }
  }

  return repaired;
}
