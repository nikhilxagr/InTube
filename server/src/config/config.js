import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { z } from 'zod';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from server root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const configSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(5000),
  HOST: z.string().default('0.0.0.0'),
  FRONTEND_URL: z.string().default('http://localhost:5173'),
  ALLOWED_ORIGINS: z.string().optional().default(''),

  // Limits
  MAX_FILE_SIZE_MB: z.coerce.number().default(100),
  MAX_UPLOAD_SIZE_MB: z.coerce.number().default(50),
  MAX_PROCESSING_TIME_MS: z.coerce.number().default(180000),
  MAX_PROCESSING_TIME_SECONDS: z.coerce.number().default(180),
  MAX_TEMP_STORAGE_MB: z.coerce.number().default(1024),
  MAX_CONCURRENT_JOBS: z.coerce.number().default(5),
  TRANSFER_EXPIRATION_SECONDS: z.coerce.number().default(600),
  TEMP_FILE_TTL_SECONDS: z.coerce.number().default(600),
  MAX_BATCH_SIZE: z.coerce.number().default(5),
  MAX_FRAME_COUNT: z.coerce.number().default(30),
  MAX_VIDEO_DURATION_SECONDS: z.coerce.number().default(600),
  MAX_IMAGE_PIXELS: z.coerce.number().default(25000000),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(15 * 60 * 1000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(100),
  DOWNLOAD_RATE_LIMIT_MAX: z.coerce.number().default(20),

  // Storage and Binaries
  TEMP_DIR: z.string().default(path.resolve(__dirname, '../../temp')),
  FFMPEG_PATH: z.string().optional().default(''),
  YTDLP_PATH: z.string().optional().default('yt-dlp'),

  // Logging
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info')
});

const parsed = configSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment configuration:', JSON.stringify(parsed.error.format(), null, 2));
  process.exit(1);
}

export const config = {
  ...parsed.data,
  isProduction: parsed.data.NODE_ENV === 'production',
  isDevelopment: parsed.data.NODE_ENV === 'development',
  isTest: parsed.data.NODE_ENV === 'test',
  MAX_FILE_SIZE_BYTES: parsed.data.MAX_FILE_SIZE_MB * 1024 * 1024,
  MAX_UPLOAD_SIZE_BYTES: parsed.data.MAX_UPLOAD_SIZE_MB * 1024 * 1024,
  resolvedTempDir: path.isAbsolute(parsed.data.TEMP_DIR)
    ? parsed.data.TEMP_DIR
    : path.resolve(__dirname, '../../', parsed.data.TEMP_DIR)
};
