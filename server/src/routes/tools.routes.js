import { Router } from 'express';
import { toolsController } from '../controllers/tools.controller.js';
import { handleFileUpload } from '../middleware/upload.middleware.js';
import { analyzeRateLimiter, downloadRateLimiter } from '../middleware/rate-limit.middleware.js';

export const toolsRouter = Router();

// Local Media Processing Endpoints
toolsRouter.post(
  '/tools/inspect',
  analyzeRateLimiter,
  handleFileUpload('file'),
  (req, res, next) => toolsController.inspect(req, res, next)
);

toolsRouter.post(
  '/tools/video-to-audio',
  downloadRateLimiter,
  handleFileUpload('file'),
  (req, res, next) => toolsController.videoToAudio(req, res, next)
);

toolsRouter.post(
  '/tools/convert',
  downloadRateLimiter,
  handleFileUpload('file'),
  (req, res, next) => toolsController.convert(req, res, next)
);

// Thumbnail Downloader Endpoint
toolsRouter.post(
  '/tools/thumbnail',
  analyzeRateLimiter,
  (req, res, next) => toolsController.thumbnail(req, res, next)
);

// QR Transfer Endpoints
toolsRouter.post(
  '/transfer/create',
  downloadRateLimiter,
  (req, res, next) => toolsController.createTransfer(req, res, next)
);

toolsRouter.get(
  '/transfer/:token',
  (req, res, next) => toolsController.getTransferInfo(req, res, next)
);

toolsRouter.get(
  '/transfer/:token/download',
  (req, res, next) => toolsController.downloadTransfer(req, res, next)
);
