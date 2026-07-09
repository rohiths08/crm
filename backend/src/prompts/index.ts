import { NormalizedRow } from '../types/index.js';
import { config } from '../config/index.js';
import { PROMPT_VERSION } from './versions.js';
import { systemPrompt } from './system.prompt.js';
import { extractionPrompt } from './extraction.prompt.js';
import { schemaPrompt } from './schema.prompt.js';
import { examplesPrompt } from './examples.prompt.js';
import { CRM_STATUSES, DATA_SOURCES } from '../types/index.js';

export class PromptService {
  private version = PROMPT_VERSION;

  /**
   * Build the complete prompt for a batch of CSV rows.
   * This is the single entry point — all prompt composition happens here.
   */
  buildBatchPrompt(rows: NormalizedRow[], headers: string[]): string {
    const dataSection = this.buildDataSection(rows, headers);
    const constraintsSection = this.buildConstraintsSection(rows.length);

    return [
      systemPrompt(),
      extractionPrompt(),
      schemaPrompt(),
      constraintsSection,
      examplesPrompt(),
      dataSection,
    ].join('\n\n---\n\n');
  }

  getVersion(): string {
    return this.version;
  }

  getModel(): string {
    return config.gemini.model;
  }

  /**
   * Build the data section with headers and rows for Gemini to process.
   */
  private buildDataSection(rows: NormalizedRow[], headers: string[]): string {
    const headerLine = headers.join(' | ');
    const rowLines = rows.map((r, i) => {
      const values = headers.map((h) => {
        const val = r.normalized[h] ?? r.raw[h] ?? '';
        // Escape pipe characters in values to avoid column misalignment
        return val.includes('|') ? `"${val}"` : val;
      });
      return `Row ${i + 1}: ${values.join(' | ')}`;
    });

    return `## Input Data\n\nCSV Headers: ${headerLine}\n\n${rowLines.join('\n')}`;
  }

  /**
   * Build batch-specific constraints (row count, valid enums).
   */
  private buildConstraintsSection(rowCount: number): string {
    return `## Constraints

- Input contains ${rowCount} row${rowCount === 1 ? '' : 's'}. Your output must account for every row.
- Valid crmStatus values: ${CRM_STATUSES.join(', ')}
- Valid dataSource values: ${DATA_SOURCES.join(', ')}
- Return ONLY the JSON object. No text before or after.`;
  }
}
