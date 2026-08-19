import fs from 'fs/promises';
import path from 'path';
import { config } from '../config/config.js';
import { isPathContained } from '../utils/file-utils.js';
import { logger } from '../utils/logger.js';

export class CleanupService {
  /**
   * Removes a specific job directory safely.
   * @param {string} jobDir
   */
  async cleanDirectory(jobDir) {
    if (!jobDir || typeof jobDir !== 'string') return;

    try {
      if (!isPathContained(jobDir, config.resolvedTempDir)) {
        logger.warn({ jobDir }, 'Refusing to clean path outside designated temp directory');
        return;
      }

      await fs.rm(jobDir, { recursive: true, force: true });
      logger.debug({ jobDir }, 'Cleaned job directory');
    } catch (err) {
      logger.error({ err, jobDir }, 'Failed to clean job directory');
    }
  }

  /**
   * Sweeps and purges leftover orphaned directories older than maxAgeMs.
   * @param {number} [maxAgeMs=3600000] - Default 1 hour
   * @returns {Promise<{ scanned: number, removed: number }>}
   */
  async sweepOrphanedTempDirs(maxAgeMs = 3600000) {
    let scanned = 0;
    let removed = 0;

    try {
      await fs.mkdir(config.resolvedTempDir, { recursive: true });
      const entries = await fs.readdir(config.resolvedTempDir, { withFileTypes: true });
      const now = Date.now();

      for (const entry of entries) {
        if (entry.name === '.gitkeep') continue;
        if (entry.isDirectory()) {
          scanned++;
          const entryPath = path.join(config.resolvedTempDir, entry.name);
          const stat = await fs.stat(entryPath);
          if (now - stat.mtimeMs >= maxAgeMs) {
            await fs.rm(entryPath, { recursive: true, force: true });
            removed++;
            logger.info({ entryPath }, 'Swept stale temporary directory');
          }
        }
      }
    } catch (err) {
      logger.error({ err }, 'Error during orphaned temp directory sweep');
    }

    return { scanned, removed };
  }
}

export const cleanupService = new CleanupService();
