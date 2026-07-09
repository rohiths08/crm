import { CrmRecord } from '../types/index.js';
import { CRM_STATUSES, DATA_SOURCES } from '../types/index.js';

export function computeConfidence(record: CrmRecord): number {
  const checks = [
    { weight: 0.15, pass: record.email.includes('@') },
    { weight: 0.15, pass: record.mobile_without_country_code.length >= 5 },
    { weight: 0.10, pass: record.company.length > 0 },
    { weight: 0.10, pass: /^\d{4}-\d{2}-\d{2}/.test(record.created_at) || record.created_at === '' },
    { weight: 0.15, pass: CRM_STATUSES.includes(record.crm_status as any) },
    { weight: 0.10, pass: DATA_SOURCES.includes(record.data_source as any) },
    { weight: 0.10, pass: record.name.length > 0 },
    { weight: 0.05, pass: record.city.length > 0 },
    { weight: 0.05, pass: record.country.length > 0 },
    { weight: 0.05, pass: record.country_code.length > 0 },
  ];

  return checks.reduce((sum, c) => sum + (c.pass ? c.weight : 0), 0);
}
