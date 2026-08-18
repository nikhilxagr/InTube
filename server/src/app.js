import express from 'express';
import pinoHttp from 'pino-http';
import { helmetMiddleware, corsMiddleware } from './middleware/security.middleware.js';
import { globalRateLimiter } from './middleware/rate-limit.middleware.js';
import { notFoundMiddleware } from './middleware/not-found.middleware.js';
import { errorMiddleware } from './middleware/error.middleware.js';
import { mediaRouter } from './routes/media.routes.js';
import { logger } from './utils/logger.js';

export function createApp() {
  const app = express();

  // Trust reverse proxies (e.g. Render / Cloudflare)
  app.set('trust proxy', 1);

  // Security Headers & CORS
  app.use(helmetMiddleware);
  app.use(corsMiddleware);

  // Structured HTTP Request Logging
  app.use(
    pinoHttp({
      logger,
      autoLogging: {
        ignore: (req) => req.url === '/api/v1/health'
      },
      customLogLevel: (_req, res, err) => {
        if (res.statusCode >= 500 || err) return 'error';
        if (res.statusCode >= 400) return 'warn';
        return 'info';
      },
      customSuccessMessage: (req, res) => `${req.method} ${req.url} completed with ${res.statusCode}`
    })
  );

  // Request Parsers
  app.use(express.json({ limit: '50kb' }));
  app.use(express.urlencoded({ extended: false, limit: '50kb' }));

  // Global Rate Limiting
  app.use(globalRateLimiter);

  // API Routes
  app.use('/api/v1', mediaRouter);

  // 404 & Error Handlers
  app.use(notFoundMiddleware);
  app.use(errorMiddleware);

  return app;
}
