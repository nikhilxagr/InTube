import { Router } from 'express';
import { mediaController } from '../controllers/media.controller.js';
import { analyzeRateLimiter, downloadRateLimiter } from '../middleware/rate-limit.middleware.js';

export const mediaRouter = Router();

mediaRouter.get('/health', (req, res) => mediaController.health(req, res));
mediaRouter.post('/media/analyze', analyzeRateLimiter, (req, res, next) => mediaController.analyze(req, res, next));
mediaRouter.post('/media/job', downloadRateLimiter, (req, res, next) => mediaController.startJob(req, res, next));
mediaRouter.get('/media/job/:jobId/progress', (req, res) => mediaController.getJobProgress(req, res));
mediaRouter.get('/media/job/:jobId/file', (req, res, next) => mediaController.getJobFile(req, res, next));
mediaRouter.post('/media/download', downloadRateLimiter, (req, res, next) => mediaController.download(req, res, next));
