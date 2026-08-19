import fs from 'fs';
import fsPromises from 'fs/promises';
import { z } from 'zod';
import { mediaService } from '../services/media.service.js';
import { providerRegistry } from '../providers/provider-registry.js';
import { cleanupService } from '../services/cleanup.service.js';
import { jobService } from '../services/job.service.js';
import { InvalidUrlError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

const analyzeSchema = z.object({
  url: z.string().min(1, 'URL cannot be empty')
});

const downloadSchema = z.object({
  url: z.string().min(1, 'URL cannot be empty'),
  formatId: z.string().min(1, 'formatId is required'),
  container: z.string().optional().default('mp4'),
  type: z.enum(['video', 'audio', 'photo']).optional().default('video')
});

export class MediaController {
  async health(req, res) {
    const memory = process.memoryUsage();

    res.status(200).json({
      success: true,
      data: {
        status: 'ok',
        service: 'intube-backend',
        version: '1.0.0',
        nodeVersion: process.version,
        uptime: Math.round(process.uptime()),
        timestamp: new Date().toISOString(),
        providers: providerRegistry.getRegisteredNames(),
        memory: {
          heapUsedMB: Math.round(memory.heapUsed / (1024 * 1024)),
          heapTotalMB: Math.round(memory.heapTotal / (1024 * 1024))
        }
      }
    });
  }

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

  async startJob(req, res, next) {
    try {
      const parsed = downloadSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new InvalidUrlError(parsed.error.errors[0]?.message || 'Invalid download parameters');
      }

      const jobId = jobService.createJob(parsed.data);

      logger.info({ jobId, url: parsed.data.url, formatId: parsed.data.formatId }, 'Started background download job');

      mediaService.download({
        ...parsed.data,
        onProgress: (progress) => {
          jobService.updateProgress(jobId, progress);
        }
      }).then((result) => {
        logger.info({ jobId, filename: result.filename }, 'Background download job completed successfully');
        jobService.completeJob(jobId, result);
      }).catch((err) => {
        logger.error({ jobId, err: err.message }, 'Background download job failed');
        jobService.failJob(jobId, err);
      });

      res.status(200).json({
        success: true,
        data: {
          jobId,
          status: 'initializing'
        }
      });
    } catch (err) {
      next(err);
    }
  }

  async getJobProgress(req, res) {
    const { jobId } = req.params;
    const job = jobService.getJob(jobId);

    if (!job) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Download job not found or expired.' }
      });
    }

    res.status(200).json({
      success: true,
      data: {
        jobId: job.jobId,
        status: job.status,
        percent: job.percent,
        total: job.total,
        speed: job.speed,
        eta: job.eta,
        statusText: job.statusText,
        error: job.error,
        filename: job.result?.filename || null
      }
    });
  }

  async getJobFile(req, res, next) {
    const { jobId } = req.params;
    const job = jobService.getJob(jobId);

    if (!job) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Download job not found or expired.' }
      });
    }

    if (job.status !== 'completed' || !job.result?.filePath) {
      return res.status(400).json({
        success: false,
        error: { code: 'NOT_READY', message: 'File is not ready yet.' }
      });
    }

    try {
      const { filePath, filename, mimeType, size } = job.result;
      const stat = await fsPromises.stat(filePath);
      const fileSize = size || stat.size;

      const safeAsciiFilename = filename.replace(/[^\x20-\x7E]/g, '_');
      const utf8Filename = encodeURIComponent(filename);

      res.setHeader('Content-Type', mimeType || 'application/octet-stream');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${safeAsciiFilename}"; filename*=UTF-8''${utf8Filename}`
      );
      res.setHeader('Content-Length', fileSize);
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

      const fileStream = fs.createReadStream(filePath);

      const performCleanup = async () => {
        await jobService.removeJob(jobId);
      };

      res.on('finish', () => {
        performCleanup().catch((err) => logger.error({ err }, 'Error cleaning job directory on finish'));
      });

      res.on('close', () => {
        if (!res.writableEnded) {
          fileStream.destroy();
          performCleanup().catch((err) => logger.error({ err }, 'Error cleaning job directory on abort'));
        }
      });

      fileStream.on('error', (err) => {
        performCleanup().catch(() => {});
        if (!res.headersSent) next(err);
      });

      fileStream.pipe(res);
    } catch (err) {
      await jobService.removeJob(jobId);
      next(err);
    }
  }

  async download(req, res, next) {
    let jobDirToClean = null;

    try {
      const parsed = downloadSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new InvalidUrlError(parsed.error.errors[0]?.message || 'Invalid download parameters');
      }

      const { filePath, filename, mimeType, jobDir, size } = await mediaService.download(parsed.data);
      jobDirToClean = jobDir;

      const stat = await fsPromises.stat(filePath);
      const fileSize = size || stat.size;

      const safeAsciiFilename = filename.replace(/[^\x20-\x7E]/g, '_');
      const utf8Filename = encodeURIComponent(filename);

      res.setHeader('Content-Type', mimeType || 'application/octet-stream');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${safeAsciiFilename}"; filename*=UTF-8''${utf8Filename}`
      );
      res.setHeader('Content-Length', fileSize);
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');

      const fileStream = fs.createReadStream(filePath);

      let isCleaned = false;
      const performCleanup = async () => {
        if (!isCleaned && jobDirToClean) {
          isCleaned = true;
          logger.debug({ jobDir: jobDirToClean }, 'Executing ephemeral download cleanup');
          await cleanupService.cleanDirectory(jobDirToClean);
        }
      };

      res.on('finish', () => {
        performCleanup().catch((err) => logger.error({ err }, 'Error cleaning job directory on finish'));
      });

      res.on('close', () => {
        if (!res.writableEnded) {
          logger.warn({ jobDir: jobDirToClean }, 'Client aborted stream before completion');
          fileStream.destroy();
          performCleanup().catch((err) => logger.error({ err }, 'Error cleaning job directory on abort'));
        }
      });

      fileStream.on('error', (err) => {
        performCleanup().catch((cleanupErr) => logger.error({ cleanupErr }, 'Error cleaning job directory on read error'));
        if (!res.headersSent) {
          next(err);
        }
      });

      fileStream.pipe(res);
    } catch (err) {
      const dirToClean = jobDirToClean || err.jobDir;
      if (dirToClean) {
        await cleanupService.cleanDirectory(dirToClean);
      }
      next(err);
    }
  }
}

export const mediaController = new MediaController();
