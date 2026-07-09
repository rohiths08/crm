import dotenv from 'dotenv';
import { z } from 'zod';
import { logger } from '../utils/logger.js';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('3001'),
  NODE_ENV: z.string().default('development'),
  GEMINI_API_KEY: z.string().min(1, 'GEMINI_API_KEY is required'),
  GROQ_API_KEY: z.string().optional(),
  GEMINI_TIMEOUT_MS: z.string().default('60000'),
  BATCH_SIZE: z.string().default('25'),
  BATCH_CONCURRENCY: z.string().default('2'),
  BATCH_MAX_RETRIES: z.string().default('1'),
  MAX_FILE_SIZE_MB: z.string().default('10'),
  JWT_SECRET: z.string().default('super-secret-development-key-change-in-prod'),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  logger.error({ errors: _env.error.format() }, 'Invalid environment variables');
  process.exit(1);
}

const env = _env.data;

export const config = {
  port: parseInt(env.PORT, 10),
  nodeEnv: env.NODE_ENV,

  gemini: {
    apiKey: env.GEMINI_API_KEY,
    model: 'gemini-3.5-flash',
    timeoutMs: parseInt(env.GEMINI_TIMEOUT_MS, 10),
  },

  groq: {
    apiKey: env.GROQ_API_KEY,
    model: 'llama-3.3-70b-versatile',
  },

  batch: {
    size: parseInt(env.BATCH_SIZE, 10),
    concurrency: parseInt(env.BATCH_CONCURRENCY, 10),
    maxRetries: parseInt(env.BATCH_MAX_RETRIES, 10),
  },

  upload: {
    maxFileSizeMb: parseInt(env.MAX_FILE_SIZE_MB, 10),
    allowedMimeTypes: ['text/csv', 'application/vnd.ms-excel', 'text/plain'],
    allowedExtensions: ['.csv', '.tsv', '.txt'],
  },

  jwt: {
    secret: env.JWT_SECRET,
  }
};
