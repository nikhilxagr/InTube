import fs from 'fs';
import fsPromises from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { ffmpegService } from '../services/ffmpeg.service.js';
import { mediaService } from '../services/media.service.js';
import { transferService } from '../services/transfer.service.js';
import { jobService } from '../services/job.service.js';
import { cleanupService } from '../services/cleanup.service.js';
import { sanitizeFilename, getMimeType } from '../utils/file-utils.js';
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

      const origExt = path.extname(req.file.originalname);
      const safeTitle = sanitizeFilename(path.basename(req.file.originalname, origExt), 'file');

      res.status(200).json({
        success: true,
        data: {
          filename: req.file.originalname,
          title: safeTitle,
          sizeBytes: req.file.size,
          sizeFormatted: `${(req.file.size / (1024 * 1024)).toFixed(2)} MB`,
          mimetype: req.file.mimetype,
          ...probe
        }
      });
    } catch (err) {
      next(err);
    } finally {
      // Inspection does not need to keep the file on disk
      if (jobDir) {
        await cleanupService.cleanDirectory(jobDir).catch(() => {});
      }
    }
  }

  /**
   * Extracts audio track from uploaded video and streams result.
   */
  async videoToAudio(req, res, next) {
    const jobDir = req.jobDir;

    try {
      if (!req.file) {
        throw new InvalidMediaFileError('Please upload a valid video or audio file.');
      }

      const parsed = audioConvertSchema.safeParse(req.body);
      const format = parsed.success ? parsed.data.format : 'mp3';
      const bitrate = parsed.success ? parsed.data.bitrate : '320k';

      const origExt = path.extname(req.file.originalname);
      const baseName = sanitizeFilename(path.basename(req.file.originalname, origExt), 'audio');
      const outputFilename = `${baseName}.${format}`;
      const outputPath = path.join(jobDir, `out_${uuidv4().slice(0, 8)}.${format}`);

      logger.info({ input: req.file.originalname, format, bitrate }, 'Extracting audio from video');

      await ffmpegService.extractAudio(req.file.path, outputPath, {
        container: format,
        bitrate
      });

      const stat = await fsPromises.stat(outputPath);
      const mimeType = getMimeType(format);

      const safeAsciiFilename = outputFilename.replace(/[^\x20-\x7E]/g, '_');
      const utf8Filename = encodeURIComponent(outputFilename);

      res.setHeader('Content-Type', mimeType);
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${safeAsciiFilename}"; filename*=UTF-8''${utf8Filename}`
      );
      res.setHeader('Content-Length', stat.size);
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

      const stream = fs.createReadStream(outputPath);

      const performCleanup = async () => {
        if (jobDir) {
          await cleanupService.cleanDirectory(jobDir).catch(() => {});
        }
      };

      res.on('finish', () => { performCleanup().catch(() => {}); });
      res.on('close', () => {
        if (!res.writableEnded) {
          stream.destroy();
          performCleanup().catch(() => {});
        }
      });
      stream.on('error', (err) => {
        performCleanup().catch(() => {});
        if (!res.headersSent) next(err);
      });

      stream.pipe(res);
    } catch (err) {
      if (jobDir) {
        await cleanupService.cleanDirectory(jobDir).catch(() => {});
      }
      next(err);
    }
  }

  /**
   * Converts uploaded video to another format (MP4, WebM, MOV) and streams result.
   */
  async convert(req, res, next) {
    const jobDir = req.jobDir;

    try {
      if (!req.file) {
        throw new InvalidMediaFileError('Please upload a valid video file.');
      }

      const parsed = videoConvertSchema.safeParse(req.body);
      const format = parsed.success ? parsed.data.format : 'mp4';
      const quality = parsed.success ? parsed.data.quality : 'balanced';

      const origExt = path.extname(req.file.originalname);
      const baseName = sanitizeFilename(path.basename(req.file.originalname, origExt), 'video');
      const outputFilename = `${baseName}.${format}`;
      const outputPath = path.join(jobDir, `out_${uuidv4().slice(0, 8)}.${format}`);

      logger.info({ input: req.file.originalname, format, quality }, 'Transcoding video format');

      await ffmpegService.convertVideo(req.file.path, outputPath, {
        format,
        quality
      });

      const stat = await fsPromises.stat(outputPath);
      const mimeType = getMimeType(format);

      const safeAsciiFilename = outputFilename.replace(/[^\x20-\x7E]/g, '_');
      const utf8Filename = encodeURIComponent(outputFilename);

      res.setHeader('Content-Type', mimeType);
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${safeAsciiFilename}"; filename*=UTF-8''${utf8Filename}`
      );
      res.setHeader('Content-Length', stat.size);
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

      const stream = fs.createReadStream(outputPath);

      const performCleanup = async () => {
        if (jobDir) {
          await cleanupService.cleanDirectory(jobDir).catch(() => {});
        }
      };

      res.on('finish', () => { performCleanup().catch(() => {}); });
      res.on('close', () => {
        if (!res.writableEnded) {
          stream.destroy();
          performCleanup().catch(() => {});
        }
      });
      stream.on('error', (err) => {
        performCleanup().catch(() => {});
        if (!res.headersSent) next(err);
      });

      stream.pipe(res);
    } catch (err) {
      if (jobDir) {
        await cleanupService.cleanDirectory(jobDir).catch(() => {});
      }
      next(err);
    }
  }

  /**
   * Retrieves official public thumbnail from a supported media URL.
   */
  async thumbnail(req, res, next) {
    try {
      const parsed = thumbnailSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new InvalidUrlError(parsed.error.errors[0]?.message || 'Invalid URL');
      }

      const mediaData = await mediaService.analyze(parsed.data.url);
      if (!mediaData || !mediaData.thumbnail) {
        throw new ThumbnailUnavailableError('Thumbnail unavailable for this media.');
      }

      res.status(200).json({
        success: true,
        data: {
          url: parsed.data.url,
          title: mediaData.title || 'Media Thumbnail',
          author: mediaData.author || null,
          platform: mediaData.platform || 'unknown',
          thumbnail: mediaData.thumbnail,
          formats: [
            { format: 'jpg', label: 'JPG Image', url: mediaData.thumbnail },
            { format: 'png', label: 'PNG Image', url: mediaData.thumbnail }
          ]
        }
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Creates a temporary QR transfer token from a completed download job.
   */
  async createTransfer(req, res, next) {
    try {
      const parsed = transferCreateSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new NotFoundError('Invalid Job ID');
      }

      const job = jobService.getJob(parsed.data.jobId);
      if (!job || job.status !== 'completed' || !job.result?.filePath) {
        throw new NotFoundError('Download job not found or not ready for transfer.');
      }

      const transfer = transferService.createTransfer({
        filePath: job.result.filePath,
        jobDir: job.result.jobDir,
        filename: job.result.filename,
        mimeType: job.result.mimeType,
        size: job.result.size,
        title: job.result.filename
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
   * Retrieves transfer landing page info for mobile phone scan.
   */
  async getTransferInfo(req, res, next) {
    try {
      const { token } = req.params;
      const info = transferService.getTransferInfo(token);

      res.status(200).json({
        success: true,
        data: info
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Streams file to mobile device using QR transfer token.
   */
  async downloadTransfer(req, res, next) {
    try {
      const { token } = req.params;
      const transfer = transferService.getTransferForDownload(token);

      const stat = await fsPromises.stat(transfer.filePath);
      const fileSize = transfer.size || stat.size;

      const safeAsciiFilename = transfer.filename.replace(/[^\x20-\x7E]/g, '_');
      const utf8Filename = encodeURIComponent(transfer.filename);

      res.setHeader('Content-Type', transfer.mimeType || 'application/octet-stream');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${safeAsciiFilename}"; filename*=UTF-8''${utf8Filename}`
      );
      res.setHeader('Content-Length', fileSize);
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

      const stream = fs.createReadStream(transfer.filePath);

      res.on('finish', () => {
        logger.info({ token }, 'QR transfer download finished');
      });

      res.on('close', () => {
        if (!res.writableEnded) {
          stream.destroy();
        }
      });

      stream.on('error', (err) => {
        if (!res.headersSent) next(err);
      });

      stream.pipe(res);
    } catch (err) {
      next(err);
    }
  }
}

export const toolsController = new ToolsController();
