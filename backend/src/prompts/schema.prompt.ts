import { CRM_STATUSES, DATA_SOURCES } from '../types/index.js';

export function schemaPrompt(): string {
  return `## Output Format

Return ONLY a single JSON object with exactly these three keys: "columnMappings", "records", "skipped".

Do NOT wrap in markdown code fences. Do NOT include any text before or after the JSON.

{
  "columnMappings": {
    "Original CSV Header": "crm_field_name"
  },
  "records": [
    {
      "created_at": "string",
      "name": "string",
      "email": "string",
      "country_code": "string",
      "mobile_without_country_code": "string",
      "company": "string",
      "city": "string",
      "state": "string",
      "country": "string",
      "lead_owner": "string",
      "crm_status": "${CRM_STATUSES.join(' | ')}",
      "crm_note": "string",
      "data_source": "${DATA_SOURCES.join(' | ')}",
      "possession_time": "string",
      "description": "string"
    }
  ],
  "skipped": [
    {
      "originalRow": ["val1", "val2", "..."],
      "reason": "string",
      "preview": {"key": "value"}
    }
  ]
}

## Validation Rules

- crm_status MUST be exactly one of: ${CRM_STATUSES.join(', ')}.
- data_source MUST be exactly one of: ${DATA_SOURCES.join(', ')}. Or empty string if not confident.
- All string fields use empty string "" when not available.
- originalRow contains the raw values from the CSV in column order.
- skipped contains rows that could not be processed (all fields empty, unparseable, etc.).
- Every row in the input must appear in either records or skipped — never both, never omitted.`;
}
