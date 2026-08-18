import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config/config.js';

/**
 * Sanitizes a title string for use in HTTP Content-Disposition headers and safe filenames.
 * @param {string} rawTitle
 * @param {string} [fallback='media']
 * @returns {string}
 */
export function sanitizeFilename(rawTitle, fallback = 'media') {
  if (!rawTitle || typeof rawTitle !== 'string') return fallback;

  // Replace invalid filesystem / header characters with underscore
  const sanitized = rawTitle
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '_')
    .replace(/[\s+]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .substring(0, 100);

  return sanitized || fallback;
}

/**
 * Creates a dedicated ephemeral job directory under temp/.
 * @returns {Promise<{ jobId: string, jobDir: string }>}
 */
export async function createJobDirectory() {
  const jobId = uuidv4();
  const jobDir = path.join(config.resolvedTempDir, jobId);

  // Ensure base temp dir exists
  await fs.mkdir(config.resolvedTempDir, { recursive: true });
  await fs.mkdir(jobDir, { recursive: true });

  return { jobId, jobDir };
}

/**
 * Ensures that a target file path is safely contained within the designated directory (Path Traversal Guard).
 * @param {string} targetPath
 * @param {string} baseDir
 * @returns {boolean}
 */
export function isPathContained(targetPath, baseDir) {
  const relative = path.relative(baseDir, targetPath);
  return !relative.startsWith('..') && !path.isAbsolute(relative);
}
