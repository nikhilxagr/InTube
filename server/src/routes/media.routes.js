import { Router } from 'express';
import { mediaController } from '../controllers/media.controller.js';
import { analyzeRateLimiter, downloadRateLimiter } from '../middleware/rate-limit.middleware.js';

export const mediaRouter = Router();

// Health endpoint
mediaRouter.get('/health', (req, res) => mediaController.health(req, res));

// Media endpoints
mediaRouter.post('/media/analyze', analyzeRateLimiter, (req, res, next) => mediaController.analyze(req, res, next));
mediaRouter.post('/media/download', downloadRateLimiter, (req, res, next) => mediaController.download(req, res, next));
