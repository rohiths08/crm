import { NormalizedRow, CsvRow } from '../types/index.js';

// Alias map: common CSV column name variations → canonical field names
// This handles ONLY deterministic, obvious aliases. Semantic mapping is done by AI.
const ALIAS_MAP: Record<string, string> = {
  // name
  name: 'name',
  'customer name': 'name',
  'lead name': 'name',
  'full name': 'name',
  'contact name': 'name',
  'contact': 'name',
  // email
  email: 'email',
  'email address': 'email',
  email_address: 'email',
  'e-mail': 'email',
  // phone
  phone: 'phone',
  'phone number': 'phone',
  mobile: 'phone',
  'mobile number': 'phone',
  telephone: 'phone',
  tel: 'phone',
  // company
  company: 'company',
  'company name': 'company',
  organization: 'company',
  business: 'company',
  org: 'company',
  // city
  city: 'city',
  // state
  state: 'state',
  province: 'state',
  region: 'state',
  // country
  country: 'country',
  nation: 'country',
  // source
  source: 'source',
  'lead source': 'source',
  'data source': 'source',
  channel: 'source',
  origin: 'source',
  // lead owner
  'lead owner': 'leadOwner',
  owner: 'leadOwner',
  'assigned to': 'leadOwner',
  agent: 'leadOwner',
  assignee: 'leadOwner',
  // created at
  'created at': 'createdAt',
  'created date': 'createdAt',
  created: 'createdAt',
  date: 'createdAt',
  'submission date': 'createdAt',
  'submit date': 'createdAt',
  timestamp: 'createdAt',
};

function normalizeAlias(header: string): string {
  const key = header.toLowerCase().trim().replace(/[\s_-]+/g, ' ');
  return ALIAS_MAP[key] ?? header;
}

export function normalizeHeaders(headers: string[]): string[] {
  return headers.map(normalizeAlias);
}

export function normalizeRow(
  raw: CsvRow,
  originalHeaders: string[],
  normalizedHeaders: string[],
): NormalizedRow {
  const normalized: Record<string, string> = {};
  originalHeaders.forEach((orig, i) => {
    const norm = normalizedHeaders[i];
    normalized[norm] = (raw[orig] ?? '').trim();
  });
  return { raw, normalized };
}
