import { Router } from 'express';
import { toolsController } from '../controllers/tools.controller.js';
import { handleFileUpload } from '../middleware/upload.middleware.js';
import { analyzeRateLimiter, downloadRateLimiter } from '../middleware/rate-limit.middleware.js';

export const toolsRouter = Router();

// Local Media Inspection
toolsRouter.post(
  '/tools/inspect',
  analyzeRateLimiter,
  handleFileUpload('file'),
  (req, res, next) => toolsController.inspect(req, res, next)
);

// Video -> Audio Converter
toolsRouter.post(
  '/tools/video-to-audio',
  downloadRateLimiter,
  handleFileUpload('file'),
  (req, res, next) => toolsController.videoToAudio(req, res, next)
);

// Audio Converter (Audio to Audio)
toolsRouter.post(
  '/tools/audio-converter',
  downloadRateLimiter,
  handleFileUpload('file'),
  (req, res, next) => toolsController.audioConverter(req, res, next)
);

// Video -> Image / Frames Extraction
toolsRouter.post(
  '/tools/video-to-image',
  downloadRateLimiter,
  handleFileUpload('file'),
  (req, res, next) => toolsController.videoToImage(req, res, next)
);

// Image Converter
toolsRouter.post(
  '/tools/image/convert',
  downloadRateLimiter,
  handleFileUpload('file'),
  (req, res, next) => toolsController.imageConvert(req, res, next)
);

// Image Compressor
toolsRouter.post(
  '/tools/image/compress',
  downloadRateLimiter,
  handleFileUpload('file'),
  (req, res, next) => toolsController.imageCompress(req, res, next)
);

// Image Resizer
toolsRouter.post(
  '/tools/image/resize',
  downloadRateLimiter,
  handleFileUpload('file'),
  (req, res, next) => toolsController.imageResize(req, res, next)
);

// Video Converter
toolsRouter.post(
  '/tools/convert',
  downloadRateLimiter,
  handleFileUpload('file'),
  (req, res, next) => toolsController.convert(req, res, next)
);

// Batch URL Analyzer
toolsRouter.post(
  '/tools/batch/analyze',
  analyzeRateLimiter,
  (req, res, next) => toolsController.batchAnalyze(req, res, next)
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
