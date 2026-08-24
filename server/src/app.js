import express from 'express';
import pinoHttp from 'pino-http';
import { requestIdMiddleware } from './middleware/request-id.middleware.js';
import { helmetMiddleware, corsMiddleware } from './middleware/security.middleware.js';
import { globalRateLimiter } from './middleware/rate-limit.middleware.js';
import { notFoundMiddleware } from './middleware/not-found.middleware.js';
import { errorMiddleware } from './middleware/error.middleware.js';
import { mediaRouter } from './routes/media.routes.js';
import { toolsRouter } from './routes/tools.routes.js';
import { logger } from './utils/logger.js';

export function createApp() {
  const app = express();

  // Trust reverse proxies (e.g. Render / Vercel / Cloudflare)
  app.set('trust proxy', 1);

  // Request correlation ID
  app.use(requestIdMiddleware);

  // Security Headers & CORS
  app.use(helmetMiddleware);
  app.use(corsMiddleware);

  // Structured HTTP Request Logging with Request Correlation ID
  app.use(
    pinoHttp({
      logger,
      genReqId: (req) => req.id,
      autoLogging: {
        ignore: (req) => req.url === '/api/v1/health'
      },
      customLogLevel: (_req, res, err) => {
        if (res.statusCode >= 500 || err) return 'error';
        if (res.statusCode >= 400) return 'warn';
        return 'info';
      },
      customSuccessMessage: (req, res) => `[${req.id}] ${req.method} ${req.url} completed with ${res.statusCode}`
    })
  );

  // Request Parsers
  app.use(express.json({ limit: '50kb' }));
  app.use(express.urlencoded({ extended: false, limit: '50kb' }));

  // Global Rate Limiting
  app.use(globalRateLimiter);

  // API Routes
  app.use('/api/v1', mediaRouter);
  app.use('/api/v1', toolsRouter);

  // 404 & Error Handlers
  app.use(notFoundMiddleware);
  app.use(errorMiddleware);

  return app;
}
