// ─── CSV Row (raw from parser) ──────────────────────────────────────────────
export interface CsvRow {
  [key: string]: string;
}

// ─── Normalized Row (after MappingService alias normalization) ──────────────
export interface NormalizedRow {
  raw: CsvRow;
  normalized: Record<string, string>;
}

// ─── CRM Record (AI-enriched output) ───────────────────────────────────────
export interface CrmRecord {
  created_at: string;
  name: string;
  email: string;
  country_code: string;
  mobile_without_country_code: string;
  company: string;
  city: string;
  state: string;
  country: string;
  lead_owner: string;
  crm_status: CrmStatus;
  crm_note: string;
  data_source: DataSource;
  possession_time: string;
  description: string;
  processing_confidence: number;
}

// ─── Skipped Record ────────────────────────────────────────────────────────
export interface SkippedRecord {
  originalRow: string[];
  reason: string;
  preview: Record<string, string>;
}

// ─── Batch ─────────────────────────────────────────────────────────────────
export interface Batch {
  index: number;
  rows: NormalizedRow[];
  headers: string[];
}

// ─── Batch Result ──────────────────────────────────────────────────────────
export interface BatchResult {
  batchIndex: number;
  records: CrmRecord[];
  skipped: SkippedRecord[];
  columnMappings: Record<string, string>;
  durationMs: number;
  retryCount: number;
}

// ─── Import Metadata ───────────────────────────────────────────────────────
export interface ImportMetadata {
  importId: string;
  model: string;
  promptVersion: string;
  batchSize: number;
  totalBatches: number;
  durationMs: number;
  startedAt: string;
  finishedAt: string;
  processingConfidence: number;
}

// ─── Import Summary ────────────────────────────────────────────────────────
export interface ImportSummary {
  totalRows: number;
  imported: number;
  skipped: number;
  processingTime: string;
  averageConfidence: number;
}

// ─── API Response ──────────────────────────────────────────────────────────
export interface ImportResponse {
  success: true;
  data: {
    summary: ImportSummary;
    metadata: ImportMetadata;
    columnMappings: Record<string, string>;
    records: CrmRecord[];
    skipped: SkippedRecord[];
  };
}

export interface ErrorResponse {
  success: false;
  error: string;
}

// ─── Enums ─────────────────────────────────────────────────────────────────
export const CRM_STATUSES = [
  'GOOD_LEAD_FOLLOW_UP',
  'SALE_DONE',
  'BAD_LEAD',
  'DID_NOT_CONNECT',
] as const;

export type CrmStatus = (typeof CRM_STATUSES)[number];

export const DATA_SOURCES = [
  'leads_on_demand',
  'meridian_tower',
  'eden_park',
  'varah_swamy',
  'sarjapur_plots',
  '',
] as const;

export type DataSource = (typeof DATA_SOURCES)[number];
