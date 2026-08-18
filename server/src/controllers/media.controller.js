import { z } from 'zod';
import { mediaService } from '../services/media.service.js';
import { providerRegistry } from '../providers/provider-registry.js';
import { InvalidUrlError } from '../utils/errors.js';

const analyzeSchema = z.object({
  url: z.string().min(1, 'URL cannot be empty')
});

const downloadSchema = z.object({
  url: z.string().min(1, 'URL cannot be empty'),
  formatId: z.string().min(1, 'formatId is required'),
  container: z.string().optional().default('mp4'),
  type: z.enum(['video', 'audio']).optional().default('video')
});

export class MediaController {
  /**
   * Health status endpoint
   */
  async health(req, res) {
    res.status(200).json({
      success: true,
      data: {
        status: 'ok',
        service: 'intube-backend',
        version: '1.0.0',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        providers: providerRegistry.getRegisteredNames()
      }
    });
  }

  /**
   * Analyze media URL
   */
  async analyze(req, res, next) {
    try {
      const parsed = analyzeSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new InvalidUrlError(parsed.error.errors[0]?.message || 'Invalid URL request body');
      }

      const result = await mediaService.analyze(parsed.data.url);
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Download media stream
   */
  async download(req, res, next) {
    try {
      const parsed = downloadSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new InvalidUrlError(parsed.error.errors[0]?.message || 'Invalid download parameters');
      }

      const downloadResult = await mediaService.download(parsed.data);
      res.status(200).json({
        success: true,
        data: downloadResult
      });
    } catch (err) {
      next(err);
    }
  }
}

export const mediaController = new MediaController();
