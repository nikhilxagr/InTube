import fs from 'fs';
import fsPromises from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config/config.js';
import { logger } from '../utils/logger.js';

export class TempFileManager {
  constructor() {
    this.tempRoot = path.resolve(config.resolvedTempDir);
    /** @type {Set<string>} */
    this.activeJobIds = new Set();

    // Ensure root temp directory exists on startup
    this.ensureTempRoot();

    // Periodic sweep scheduler every 5 minutes
    this.sweepInterval = globalThis.setInterval(() => {
      this.cleanupExpiredFiles(config.TEMP_FILE_TTL_SECONDS);
    }, 5 * 60 * 1000);

    if (this.sweepInterval.unref) {
      this.sweepInterval.unref();
    }
  }

  ensureTempRoot() {
    try {
      if (!fs.existsSync(this.tempRoot)) {
        fs.mkdirSync(this.tempRoot, { recursive: true });
        logger.info({ tempRoot: this.tempRoot }, 'Created root temp directory');
      }
    } catch (err) {
      logger.error({ err, tempRoot: this.tempRoot }, 'Failed to create root temp directory');
    }
  }

  /**
   * Registers an active in-flight job ID.
   * @param {string} jobId
   */
  registerActiveJob(jobId) {
    if (jobId) this.activeJobIds.add(jobId);
  }

  /**
   * Unregisters an active job ID.
   * @param {string} jobId
   */
  unregisterActiveJob(jobId) {
    if (jobId) this.activeJobIds.delete(jobId);
  }

  /**
   * Alias for unregisterActiveJob.
   * @param {string} jobId
   */
  releaseActiveJob(jobId) {
    this.unregisterActiveJob(jobId);
  }

  /**
   * Checks if a job ID is currently active.
   * @param {string} jobId
   * @returns {boolean}
   */
  isActiveJob(jobId) {
    return this.activeJobIds.has(jobId);
  }

  /**
   * Alias for isActiveJob.
   * @param {string} jobId
   * @returns {boolean}
   */
  isJobActive(jobId) {
    return this.isActiveJob(jobId);
  }

  /**
   * Stops the background sweep interval timer.
   */
  stopPeriodicSweep() {
    if (this.sweepInterval) {
      globalThis.clearInterval(this.sweepInterval);
      this.sweepInterval = null;
    }
  }

  /**
   * Alias for cleanupExpiredFiles.
   * @param {number} [ttlSeconds]
   * @returns {Promise<number>}
   */
  async sweepOldFiles(ttlSeconds) {
    return this.cleanupExpiredFiles(ttlSeconds);
  }

  /**
   * Creates an isolated job directory inside tempRoot.
   * @param {string} [prefix='job']
   * @returns {Promise<{ jobId: string, jobDir: string }>}
   */
  async createJobDirectory(prefix = 'job') {
    this.ensureTempRoot();
    const jobId = `${prefix}-${uuidv4()}`;
    const jobDir = path.join(this.tempRoot, jobId);

    await fsPromises.mkdir(jobDir, { recursive: true });
    this.registerActiveJob(jobId);

    return { jobId, jobDir };
  }

  /**
   * Validates and resolves a safe path within a job directory.
   * Prevents path traversal outside jobDir.
   * @param {string} jobDir
   * @param {string} filename
   * @returns {string}
   */
  createTempPath(jobDir, filename) {
    const safeFilename = path.basename(filename);
    const resolved = path.resolve(jobDir, safeFilename);

    if (!resolved.startsWith(path.resolve(jobDir))) {
      throw new Error('Path traversal attempt detected in TempFileManager');
    }

    return resolved;
  }

  /**
   * Safely deletes a job directory and its contents.
   * @param {string} jobDirOrId
   */
  async cleanupJob(jobDirOrId) {
    if (!jobDirOrId) return;

    let targetDir = jobDirOrId;
    let jobId = null;

    if (!path.isAbsolute(jobDirOrId)) {
      jobId = jobDirOrId;
      targetDir = path.join(this.tempRoot, jobDirOrId);
    } else {
      jobId = path.basename(jobDirOrId);
    }

    const resolved = path.resolve(targetDir);
    const resolvedRoot = path.resolve(this.tempRoot);

    // Defense-in-depth: Never delete outside tempRoot or tempRoot itself
    if (!resolved.startsWith(resolvedRoot) || resolved === resolvedRoot) {
      logger.warn({ targetDir, tempRoot: this.tempRoot }, 'Prevented unsafe directory deletion outside temp root');
      return;
    }

    try {
      await fsPromises.rm(resolved, { recursive: true, force: true });
      if (jobId) this.unregisterActiveJob(jobId);
      logger.debug({ jobDir: resolved }, 'Cleaned up job directory');
    } catch (err) {
      logger.warn({ err: err.message, jobDir: resolved }, 'Error cleaning up job directory');
    }
  }

  /**
   * Sweeps and removes temporary directories older than ttlSeconds.
   * Ignores currently active jobs.
   * @param {number} [ttlSeconds=600]
   */
  async cleanupExpiredFiles(ttlSeconds = config.TEMP_FILE_TTL_SECONDS) {
    let deletedCount = 0;
    try {
      if (!fs.existsSync(this.tempRoot)) return deletedCount;

      const entries = await fsPromises.readdir(this.tempRoot, { withFileTypes: true });
      const now = Date.now();
      const maxAgeMs = ttlSeconds * 1000;

      for (const entry of entries) {
        if (entry.isDirectory()) {
          const dirPath = path.join(this.tempRoot, entry.name);
          const jobId = entry.name;

          // Do not delete currently active jobs
          if (this.isActiveJob(jobId)) {
            continue;
          }

          try {
            const stats = await fsPromises.stat(dirPath);
            const ageMs = now - stats.mtimeMs;

            if (ageMs > maxAgeMs) {
              await fsPromises.rm(dirPath, { recursive: true, force: true });
              deletedCount++;
              logger.info({ dir: entry.name, ageSec: Math.round(ageMs / 1000) }, 'Purged expired temporary job directory');
            }
          } catch {
            // Ignore stat errors for deleted entries
          }
        }
      }
    } catch (err) {
      logger.error({ err: err.message }, 'Failed during periodic temp cleanup sweep');
    }
    return deletedCount;
  }
}

export const tempFileManager = new TempFileManager();
