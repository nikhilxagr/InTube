import helmet from 'helmet';
import cors from 'cors';
import { config } from '../config/config.js';

export const helmetMiddleware = helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
});

const allowedOrigins = [
  ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',').map((s) => s.trim()) : []),
  config.FRONTEND_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173'
].filter(Boolean);

export const corsMiddleware = cors({
  origin: (origin, callback) => {
    if (!origin || !config.isProduction || process.env.ALLOWED_ORIGINS === '*') {
      return callback(null, true);
    }

    if (
      allowedOrigins.includes(origin) ||
      allowedOrigins.includes('*') ||
      origin.endsWith('.vercel.app') ||
      origin.endsWith('.onrender.com')
    ) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked for origin: ${origin}`), false);
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Accept', 'X-Requested-With', 'X-Request-ID'],
  exposedHeaders: ['Content-Disposition', 'Content-Length', 'X-Request-ID'],
  credentials: false
});
