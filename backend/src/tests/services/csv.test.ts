import { describe, it, expect, afterAll } from 'vitest';
import { streamCsvRows, detectDelimiter } from '../../services/csv.service.js';
import * as fs from 'fs';
import * as path from 'path';

describe('CSV Service', () => {
  const tempCsvPath = path.join(process.cwd(), 'temp_test.csv');

  afterAll(() => {
    if (fs.existsSync(tempCsvPath)) {
      fs.unlinkSync(tempCsvPath);
    }
  });

  it('should detect delimiters correctly', () => {
    expect(detectDelimiter('a,b,c\n1,2,3')).toBe(',');
    expect(detectDelimiter('a;b;c\n1;2;3')).toBe(';');
    expect(detectDelimiter('a\tb\tc\n1\t2\t3')).toBe('\t');
    expect(detectDelimiter('a|b|c\n1|2|3')).toBe('|');
  });

  it('should stream rows and normalize headers and values', async () => {
    const csvContent = 'Customer Name,Email Address,Phone Number\nSarah Johnson,sarah@techcorp.com,+1-415-555-0132\nMichael Chen,mchen@innovate.io,+82-10-5555-1234\n';
    fs.writeFileSync(tempCsvPath, csvContent);

    const chunks: any[] = [];
    for await (const chunk of streamCsvRows(tempCsvPath)) {
      chunks.push(chunk);
    }

    expect(chunks).toHaveLength(2);
    expect(chunks[0].row.normalized.name).toBe('Sarah Johnson');
    expect(chunks[0].row.normalized.email).toBe('sarah@techcorp.com');
    expect(chunks[0].row.normalized.phone).toBe('+1-415-555-0132');
    expect(chunks[0].originalHeaders).toEqual(['Customer Name', 'Email Address', 'Phone Number']);
    expect(chunks[0].normalizedHeaders).toEqual(['name', 'email', 'phone']);
    expect(chunks[0].delimiter).toBe(',');
  });
});
