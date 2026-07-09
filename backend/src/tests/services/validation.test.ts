import { describe, it, expect } from 'vitest';
import { validateBatchResponse } from '../../services/validation.service.js';

describe('Validation Service', () => {
  it('should pass records that have either email or mobile number', async () => {
    const rawResponse = {
      columnMappings: { 'Cust Name': 'name' },
      records: [
        {
          name: 'Sarah',
          email: 'sarah@techcorp.com',
          mobile_without_country_code: '',
        },
        {
          name: 'Michael',
          email: '',
          mobile_without_country_code: '5551234',
        },
      ],
      skipped: [],
    };

    const result = await validateBatchResponse(rawResponse, ['Cust Name'], '123', 1);
    expect(result.records).toHaveLength(2);
    expect(result.skipped).toHaveLength(0);
  });

  it('should skip records that have neither email nor mobile number', async () => {
    const rawResponse = {
      columnMappings: { 'Cust Name': 'name' },
      records: [
        {
          name: 'No Contact Info Lead',
          email: '',
          mobile_without_country_code: '',
          company: 'Mystery Co',
        },
      ],
      skipped: [],
    };

    const result = await validateBatchResponse(rawResponse, ['Cust Name'], '123', 1);
    expect(result.records).toHaveLength(0);
    expect(result.skipped).toHaveLength(1);
    expect(result.skipped[0].reason).toContain('contains neither email nor mobile number');
    expect(result.skipped[0].preview.name).toBe('No Contact Info Lead');
  });
});
