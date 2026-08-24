import fs from 'fs';
import fsPromises from 'fs/promises';
import path from 'path';
import { createRequire } from 'module';
import { z } from 'zod';

const require = createRequire(import.meta.url);
const archiver = require('archiver');
import { ffmpegService } from '../services/ffmpeg.service.js';
import { imageService } from '../services/image.service.js';
import { mediaService } from '../services/media.service.js';
import { transferService } from '../services/transfer.service.js';
import { jobService } from '../services/job.service.js';
import { tempFileManager } from '../services/temp-file-manager.service.js';
import { config } from '../config/config.js';
import { getMimeType } from '../utils/file-utils.js';
import { generateSafeFilename } from '../utils/filename.utils.js';
import {
  InvalidUrlError,
  InvalidMediaFileError,
  ThumbnailUnavailableError,
  NotFoundError
} from '../utils/errors.js';
import { logger } from '../utils/logger.js';

const thumbnailSchema = z.object({
  url: z.string().min(1, 'URL cannot be empty')
});

const audioConvertSchema = z.object({
  format: z.enum(['mp3', 'm4a', 'wav', 'aac', 'ogg']).default('mp3'),
  bitrate: z.enum(['128k', '192k', '256k', '320k']).default('320k')
});

const videoConvertSchema = z.object({
  format: z.enum(['mp4', 'webm', 'mov']).default('mp4'),
  quality: z.enum(['balanced', 'high', 'small']).default('balanced')
});

const videoToImageSchema = z.object({
  mode: z.enum(['first_frame', 'timestamp', 'interval']).default('first_frame'),
  timestamp: z.string().optional().default('00:00:00.100'),
  interval: z.coerce.number().min(1).max(60).optional().default(5),
  format: z.enum(['jpg', 'png', 'webp']).default('jpg')
});

const imageConvertSchema = z.object({
  format: z.enum(['jpg', 'png', 'webp', 'avif']).default('webp'),
  quality: z.coerce.number().min(10).max(100).optional().default(85)
});

const imageCompressSchema = z.object({
  quality: z.coerce.number().min(10).max(100).optional().default(75)
});

const imageResizeSchema = z.object({
  width: z.coerce.number().min(1).max(8000).optional(),
  height: z.coerce.number().min(1).max(8000).optional(),
  allowUpscale: z.preprocess((val) => val === 'true' || val === true, z.boolean()).default(false)
});

const batchAnalyzeSchema = z.object({
  urls: z.array(z.string().min(1)).min(1, 'At least 1 URL is required').max(config.MAX_BATCH_SIZE, `Maximum ${config.MAX_BATCH_SIZE} URLs allowed per batch`)
});

const transferCreateSchema = z.object({
  jobId: z.string().uuid('Invalid Job ID')
});

export class ToolsController {
  /**
   * Inspects a local media file and returns technical metadata.
   */
  async inspect(req, res, next) {
    const jobDir = req.jobDir;

    try {
      if (!req.file) {
        throw new InvalidMediaFileError('Please upload a valid media file.');
      }

      logger.info({ file: req.file.originalname, size: req.file.size }, 'Inspecting media file metadata');
      const probe = await ffmpegService.probeMedia(req.file.path);

      const safeFilename = generateSafeFilename(req.file.originalname, path.extname(req.file.originalname).slice(1));

      res.status(200).json({
        success: true,
        data: {
          filename: req.file.originalname,
          title: safeFilename,
          sizeBytes: req.file.size,
          sizeFormatted: `${(req.file.size / (1024 * 1024)).toFixed(2)} MB`,
          mimetype: req.file.mimetype,
          ...probe
        }
      });
    } catch (err) {
      next(err);
    } finally {
      if (jobDir) {
        await tempFileManager.cleanupJob(jobDir).catch(() => {});
      }
    }
  }

  /**
   * Video -> Audio conversion.
   */
  async videoToAudio(req, res, next) {
    const jobDir = req.jobDir;

    try {
      if (!req.file) {
        throw new InvalidMediaFileError('Please upload a video file to extract audio.');
      }

      const parsed = audioConvertSchema.safeParse(req.body);
      const { format, bitrate } = parsed.success ? parsed.data : { format: 'mp3', bitrate: '320k' };

      const safeBaseName = generateSafeFilename(req.file.originalname, format, 'audio');
      const outputPath = path.join(jobDir, safeBaseName);

      logger.info({ file: req.file.originalname, format, bitrate }, 'Extracting audio from video');

      await ffmpegService.extractAudio(req.file.path, outputPath, {
        container: format,
        bitrate
      });

      const stat = await fsPromises.stat(outputPath);
      const mimeType = getMimeType(format);

      this.streamAndCleanup(req, res, outputPath, safeBaseName, mimeType, stat.size, jobDir);
    } catch (err) {
      if (jobDir) {
        await tempFileManager.cleanupJob(jobDir).catch(() => {});
      }
      next(err);
    }
  }

  /**
   * Audio converter (converts between audio formats).
   */
  async audioConverter(req, res, next) {
    const jobDir = req.jobDir;

    try {
      if (!req.file) {
        throw new InvalidMediaFileError('Please upload an audio file to convert.');
      }

      const parsed = audioConvertSchema.safeParse(req.body);
      const { format, bitrate } = parsed.success ? parsed.data : { format: 'mp3', bitrate: '320k' };

      const safeBaseName = generateSafeFilename(req.file.originalname, format, 'audio');
      const outputPath = path.join(jobDir, safeBaseName);

      logger.info({ file: req.file.originalname, format, bitrate }, 'Converting audio format');

      await ffmpegService.convertAudio(req.file.path, outputPath, {
        container: format,
        bitrate
      });

      const stat = await fsPromises.stat(outputPath);
      const mimeType = getMimeType(format);

      this.streamAndCleanup(req, res, outputPath, safeBaseName, mimeType, stat.size, jobDir);
    } catch (err) {
      if (jobDir) {
        await tempFileManager.cleanupJob(jobDir).catch(() => {});
      }
      next(err);
    }
  }

  /**
   * Video -> Image / Frame extraction.
   */
  async videoToImage(req, res, next) {
    const jobDir = req.jobDir;

    try {
      if (!req.file) {
        throw new InvalidMediaFileError('Please upload a video file for frame extraction.');
      }

      const parsed = videoToImageSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new InvalidMediaFileError(parsed.error.errors[0]?.message || 'Invalid frame extraction parameters');
      }

      const { mode, timestamp, interval, format } = parsed.data;

      // Inspect duration limit
      const probe = await ffmpegService.probeMedia(req.file.path);
      if (probe.duration && probe.duration > config.MAX_VIDEO_DURATION_SECONDS) {
        throw new InvalidMediaFileError(
          `Video duration (${Math.round(probe.duration)}s) exceeds maximum allowed duration (${config.MAX_VIDEO_DURATION_SECONDS}s).`
        );
      }

      logger.info({ file: req.file.originalname, mode, format }, 'Extracting frames from video');

      if (mode === 'first_frame' || mode === 'timestamp') {
        // Single frame output
        const safeBaseName = generateSafeFilename(req.file.originalname, format, 'frame');
        const outputPath = path.join(jobDir, safeBaseName);

        await ffmpegService.extractFrames(req.file.path, outputPath, {
          mode,
          timestamp
        });

        const stat = await fsPromises.stat(outputPath);
        const mimeType = getMimeType(format);

        this.streamAndCleanup(req, res, outputPath, safeBaseName, mimeType, stat.size, jobDir);
      } else {
        // Interval mode -> package frames into ZIP
        const framesDir = path.join(jobDir, 'frames');
        await fsPromises.mkdir(framesDir, { recursive: true });

        const framePattern = path.join(framesDir, `frame_%03d.${format}`);

        await ffmpegService.extractFrames(req.file.path, framePattern, {
          mode: 'interval',
          interval,
          maxFrames: config.MAX_FRAME_COUNT
        });

        const frameFiles = await fsPromises.readdir(framesDir);
        if (!frameFiles || frameFiles.length === 0) {
          throw new InvalidMediaFileError('No frames could be extracted from the video.');
        }

        const zipFilename = generateSafeFilename(req.file.originalname, 'zip', 'extracted-frames');
        const zipPath = path.join(jobDir, zipFilename);

        await new Promise((resolve, reject) => {
          const output = fs.createWriteStream(zipPath);
          const archive = archiver('zip', { zlib: { level: 6 } });

          output.on('close', resolve);
          archive.on('error', reject);
          archive.pipe(output);

          archive.directory(framesDir, false);
          archive.finalize();
        });

        const stat = await fsPromises.stat(zipPath);
        this.streamAndCleanup(req, res, zipPath, zipFilename, 'application/zip', stat.size, jobDir);
      }
    } catch (err) {
      if (jobDir) {
        await tempFileManager.cleanupJob(jobDir).catch(() => {});
      }
      next(err);
    }
  }

  /**
   * Image format converter (JPG, PNG, WebP, AVIF).
   */
  async imageConvert(req, res, next) {
    const jobDir = req.jobDir;

    try {
      if (!req.file) {
        throw new InvalidMediaFileError('Please upload an image file.');
      }

      const parsed = imageConvertSchema.safeParse(req.body);
      const { format, quality } = parsed.success ? parsed.data : { format: 'webp', quality: 85 };

      const safeFilename = generateSafeFilename(req.file.originalname, format, 'converted-image');
      const outputPath = path.join(jobDir, safeFilename);

      logger.info({ file: req.file.originalname, targetFormat: format }, 'Converting image format');

      await imageService.convert(req.file.path, outputPath, format, { quality });

      const stat = await fsPromises.stat(outputPath);
      const mimeType = getMimeType(format);

      this.streamAndCleanup(req, res, outputPath, safeFilename, mimeType, stat.size, jobDir);
    } catch (err) {
      if (jobDir) {
        await tempFileManager.cleanupJob(jobDir).catch(() => {});
      }
      next(err);
    }
  }

  /**
   * Image compressor.
   */
  async imageCompress(req, res, next) {
    const jobDir = req.jobDir;

    try {
      if (!req.file) {
        throw new InvalidMediaFileError('Please upload an image file to compress.');
      }

      const parsed = imageCompressSchema.safeParse(req.body);
      const { quality } = parsed.success ? parsed.data : { quality: 75 };

      const ext = path.extname(req.file.originalname).slice(1) || 'jpg';
      const safeFilename = generateSafeFilename(req.file.originalname, ext, 'compressed-image');
      const outputPath = path.join(jobDir, safeFilename);

      logger.info({ file: req.file.originalname, quality }, 'Compressing image');

      const result = await imageService.compress(req.file.path, outputPath, { quality });

      res.setHeader('X-Original-Size', result.originalSizeBytes);
      res.setHeader('X-Output-Size', result.outputSizeBytes);
      res.setHeader('X-Reduction-Percent', result.reductionPercent);

      const mimeType = getMimeType(ext);
      this.streamAndCleanup(req, res, outputPath, safeFilename, mimeType, result.outputSizeBytes, jobDir);
    } catch (err) {
      if (jobDir) {
        await tempFileManager.cleanupJob(jobDir).catch(() => {});
      }
      next(err);
    }
  }

  /**
   * Image resizer.
   */
  async imageResize(req, res, next) {
    const jobDir = req.jobDir;

    try {
      if (!req.file) {
        throw new InvalidMediaFileError('Please upload an image file to resize.');
      }

      const parsed = imageResizeSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new InvalidMediaFileError(parsed.error.errors[0]?.message || 'Invalid resize dimensions');
      }

      const ext = path.extname(req.file.originalname).slice(1) || 'jpg';
      const safeFilename = generateSafeFilename(req.file.originalname, ext, 'resized-image');
      const outputPath = path.join(jobDir, safeFilename);

      logger.info({ file: req.file.originalname, width: parsed.data.width, height: parsed.data.height }, 'Resizing image');

      const result = await imageService.resize(req.file.path, outputPath, parsed.data);

      const mimeType = getMimeType(ext);
      this.streamAndCleanup(req, res, outputPath, safeFilename, mimeType, result.outputSizeBytes, jobDir);
    } catch (err) {
      if (jobDir) {
        await tempFileManager.cleanupJob(jobDir).catch(() => {});
      }
      next(err);
    }
  }

  /**
   * Video format converter (MP4, WebM, MOV).
   */
  async convert(req, res, next) {
    const jobDir = req.jobDir;

    try {
      if (!req.file) {
        throw new InvalidMediaFileError('Please upload a video file to convert.');
      }

      const parsed = videoConvertSchema.safeParse(req.body);
      const { format, quality } = parsed.success ? parsed.data : { format: 'mp4', quality: 'balanced' };

      const safeBaseName = generateSafeFilename(req.file.originalname, format, 'converted-video');
      const outputPath = path.join(jobDir, safeBaseName);

      logger.info({ file: req.file.originalname, format, quality }, 'Transcoding video container/codec');

      await ffmpegService.convertVideo(req.file.path, outputPath, {
        container: format,
        quality
      });

      const stat = await fsPromises.stat(outputPath);
      const mimeType = getMimeType(format);

      this.streamAndCleanup(req, res, outputPath, safeBaseName, mimeType, stat.size, jobDir);
    } catch (err) {
      if (jobDir) {
        await tempFileManager.cleanupJob(jobDir).catch(() => {});
      }
      next(err);
    }
  }

  /**
   * Batch URL analyze endpoint.
   */
  async batchAnalyze(req, res, next) {
    try {
      const parsed = batchAnalyzeSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new InvalidUrlError(parsed.error.errors[0]?.message || 'Invalid batch URLs');
      }

      // Deduplicate URLs
      const uniqueUrls = [...new Set(parsed.data.urls.map(u => u.trim()))];
      logger.info({ count: uniqueUrls.length }, 'Analyzing batch URLs');

      const results = await Promise.all(
        uniqueUrls.map(async (url) => {
          try {
            const data = await mediaService.analyze(url);
            return {
              url,
              status: 'ready',
              metadata: data,
              error: null
            };
          } catch (err) {
            return {
              url,
              status: 'error',
              metadata: null,
              error: err.message || 'Analysis failed'
            };
          }
        })
      );

      res.status(200).json({
        success: true,
        data: {
          total: results.length,
          readyCount: results.filter(r => r.status === 'ready').length,
          items: results
        }
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * HD Thumbnail extraction.
   */
  async thumbnail(req, res, next) {
    try {
      const parsed = thumbnailSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new InvalidUrlError(parsed.error.errors[0]?.message || 'Invalid URL');
      }

      logger.info({ url: parsed.data.url }, 'Retrieving HD thumbnail');
      const media = await mediaService.analyze(parsed.data.url);

      if (!media.thumbnail) {
        throw new ThumbnailUnavailableError('No public cover art found for this URL.');
      }

      res.status(200).json({
        success: true,
        data: {
          url: media.url,
          title: media.title,
          platform: media.platform,
          thumbnail: media.thumbnail,
          formats: [
            { format: 'jpg', label: 'JPG Standard Quality', url: media.thumbnail },
            { format: 'png', label: 'PNG Lossless Format', url: media.thumbnail }
          ]
        }
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Creates an ephemeral QR transfer token for a completed download job.
   */
  async createTransfer(req, res, next) {
    try {
      const parsed = transferCreateSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new InvalidUrlError(parsed.error.errors[0]?.message || 'Invalid transfer parameters');
      }

      const job = jobService.getJob(parsed.data.jobId);
      if (!job || job.status !== 'completed' || !job.result?.filePath) {
        throw new NotFoundError('No completed download file found for this Job ID');
      }

      const transfer = await transferService.createTransfer({
        jobId: job.jobId,
        filePath: job.result.filePath,
        filename: job.result.filename,
        title: job.metadata?.title || 'Media File',
        mimeType: job.result.mimeType,
        size: job.result.size
      });

      res.status(200).json({
        success: true,
        data: transfer
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Retrieves transfer details for mobile phone landing.
   */
  async getTransferInfo(req, res, next) {
    try {
      const { token } = req.params;
      const transfer = transferService.getTransfer(token);

      res.status(200).json({
        success: true,
        data: {
          token: transfer.token,
          filename: transfer.filename,
          title: transfer.title,
          size: transfer.size,
          sizeFormatted: `${(transfer.size / (1024 * 1024)).toFixed(2)} MB`,
          mimeType: transfer.mimeType,
          expiresAt: transfer.expiresAt,
          remainingSeconds: Math.max(0, Math.round((transfer.expiresAt - Date.now()) / 1000))
        }
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Downloads the transfer file to the mobile device.
   */
  async downloadTransfer(req, res, next) {
    try {
      const { token } = req.params;
      const transfer = transferService.getTransfer(token);

      const filePath = transfer.filePath;
      const stat = await fsPromises.stat(filePath);

      const safeAsciiFilename = transfer.filename.replace(/[^\x20-\x7E]/g, '_');
      const utf8Filename = encodeURIComponent(transfer.filename);

      res.setHeader('Content-Type', transfer.mimeType || 'application/octet-stream');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${safeAsciiFilename}"; filename*=UTF-8''${utf8Filename}`
      );
      res.setHeader('Content-Length', stat.size);
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

      const stream = fs.createReadStream(filePath);
      stream.pipe(res);

      stream.on('error', (err) => {
        logger.error({ err }, 'Error streaming transfer file');
        if (!res.headersSent) res.status(500).end();
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Helper to stream file and guaranteed cleanup.
   */
  streamAndCleanup(req, res, filePath, filename, mimeType, size, jobDir) {
    const safeAsciiFilename = filename.replace(/[^\x20-\x7E]/g, '_');
    const utf8Filename = encodeURIComponent(filename);

    res.setHeader('Content-Type', mimeType || 'application/octet-stream');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${safeAsciiFilename}"; filename*=UTF-8''${utf8Filename}`
    );
    if (size) res.setHeader('Content-Length', size);
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);

    let cleaned = false;
    const cleanup = async () => {
      if (cleaned) return;
      cleaned = true;
      if (jobDir) {
        await tempFileManager.cleanupJob(jobDir).catch(() => {});
      }
    };

    res.on('finish', cleanup);
    res.on('close', cleanup);
    stream.on('error', (streamErr) => {
      logger.error({ err: streamErr }, 'Error streaming output file');
      cleanup();
      if (!res.headersSent) res.status(500).end();
    });
  }
}

export const toolsController = new ToolsController();
