import { describe, it, expect, vi } from 'vitest';
import { executeWithRetry } from '../../services/retry.service.js';

describe('executeWithRetry', () => {
  it('should return value on first success', async () => {
    const fn = vi.fn().mockResolvedValue('success');
    const result = await executeWithRetry(fn, { importId: '123', batchNumber: 1 });
    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should retry on retryable errors and succeed', async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error('Rate limit exceeded (429)'))
      .mockResolvedValueOnce('success');

    const result = await executeWithRetry(fn, { importId: '123', batchNumber: 1 });
    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('should not retry on client errors (e.g. invalid_argument)', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('invalid_argument: Column mapping failed'));
    await expect(executeWithRetry(fn, { importId: '123', batchNumber: 1 })).rejects.toThrow();
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
