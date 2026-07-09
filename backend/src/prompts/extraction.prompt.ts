import { CRM_STATUSES, DATA_SOURCES } from '../types/index.js';

export function extractionPrompt(): string {
  return `## Task

Analyze the CSV data below and extract CRM fields for each row.

## Field Extraction Rules

| CRM Field | Extraction Logic |
|---|---|
| created_at | Parse any date-like value and ensure it is convertible using JavaScript "new Date(created_at)". E.g. YYYY-MM-DD HH:MM:SS |
| name | Best match for a person's full name from any column. |
| email | Valid email address (lowercase). If multiple emails exist, use the FIRST email. Empty string if none found. |
| country_code | International dial code (e.g. +1, +44, +82). Extract from phone if present, otherwise empty string. |
| mobile_without_country_code | Phone number digits only, no dashes/spaces/country code. If multiple numbers exist, use the FIRST mobile number. Empty string if none found. |
| company | Company or organization name. Empty string if none found. |
| city | City name. Empty string if none found. |
| state | State, province, or region. Empty string if none found. |
| country | Country name. Empty string if none found. |
| lead_owner | Person responsible for this lead. Empty string if none found. |
| crm_status | Must be exactly one of: ${CRM_STATUSES.join(', ')}. |
| crm_note | Brief note. You MUST append any extra/remaining email addresses and any extra/remaining phone numbers here if they exist. Also include any remarks/follow-up notes. Empty string if none. |
| data_source | Must be exactly one of: ${DATA_SOURCES.join(', ')}. Map from the source column. If none match confidently, leave it blank (empty string). |
| possession_time | How long the lead has been in the system. Empty string if not determinable. |
| description | Brief description of the lead or their inquiry. Empty string if none. |

## Important Rules

1. **Multiple Emails or Mobile Numbers:** 
   - If multiple email addresses exist, put the FIRST email in the \`email\` field, and append the remaining emails into the \`crm_note\` field.
   - If multiple mobile numbers exist, put the FIRST mobile in \`mobile_without_country_code\` and append the remaining numbers into \`crm_note\`.

2. **Skip Invalid Records:**
   - If a record contains NEITHER an email NOR a mobile number, then you MUST completely skip that record. Put it entirely in the \`skipped\` array with a \`reason\` indicating missing contact info. Do not put it in \`records\`.

## Column Mapping Rules

Analyze the CSV headers and determine which original column maps to which CRM field.
- Only map columns that have a clear semantic match.
- Multiple CSV columns can map to different CRM fields.
- A column that doesn't map to any CRM field should not appear in columnMappings.
- Use the original column name as the key, and the CRM field name as the value.`;
}
