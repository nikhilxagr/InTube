import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config/config.js';
import { FileTooLargeError } from './errors.js';

// Windows reserved filenames
const WINDOWS_RESERVED_NAMES = new Set([
  'CON', 'PRN', 'AUX', 'NUL',
  'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9',
  'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9'
]);

/**
 * Sanitizes a title string for use in HTTP Content-Disposition headers and safe filenames.
 * Strips path separators, null bytes, control characters, and reserved system names.
 * @param {string} rawTitle
 * @param {string} [fallback='media']
 * @returns {string}
 */
export function sanitizeFilename(rawTitle, fallback = 'media') {
  if (!rawTitle || typeof rawTitle !== 'string') return fallback;

  // Replace invalid filesystem / header characters with underscore
  let sanitized = rawTitle
    .replace(/[\x00-\x1F\x7F-\x9F]/g, '') // Control characters
    .replace(/[<>:"/\\|?*]/g, '_')
    .replace(/[\s+]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^[-_.]+|[-_.]+$/g, '') // Strip leading/trailing dots, dashes, underscores
    .substring(0, 100);

  // Check if sanitized base matches reserved Windows device names
  const baseUpper = sanitized.toUpperCase();
  if (WINDOWS_RESERVED_NAMES.has(baseUpper) || WINDOWS_RESERVED_NAMES.has(baseUpper.split('.')[0])) {
    sanitized = `${sanitized}_file`;
  }

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
  if (!targetPath || !baseDir) return false;
  const resolvedTarget = path.resolve(targetPath);
  const resolvedBase = path.resolve(baseDir);
  const relative = path.relative(resolvedBase, resolvedTarget);

  return !relative.startsWith('..') && !path.isAbsolute(relative);
}

/**
 * Returns the MIME type associated with a container / file extension.
 * @param {string} container
 * @returns {string}
 */
export function getMimeType(container) {
  const ext = (container || '').toLowerCase().replace(/^\./, '');
  const map = {
    mp4: 'video/mp4',
    webm: 'video/webm',
    mkv: 'video/x-matroska',
    mp3: 'audio/mpeg',
    m4a: 'audio/mp4',
    aac: 'audio/aac',
    wav: 'audio/wav',
    ogg: 'audio/ogg',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp'
  };

  return map[ext] || 'application/octet-stream';
}

/**
 * Streams a remote URL directly to a file on disk without accumulating the buffer in RAM.
 * Enforces maximum file size limit during download stream.
 * @param {string} url
 * @param {string} targetPath
 * @param {object} [options={}]
 * @param {number} [options.maxSizeBytes]
 * @returns {Promise<void>}
 */
export async function streamUrlToFile(url, targetPath, options = {}) {
  const maxBytes = options.maxSizeBytes || config.MAX_FILE_SIZE_BYTES;
  const headers = options.headers || {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
  };

  const res = await fetch(url, { headers });
  if (!res.ok) {
    throw new Error(`Remote stream responded with HTTP ${res.status}: ${res.statusText}`);
  }

  const contentLength = res.headers.get('content-length');
  if (contentLength && parseInt(contentLength, 10) > maxBytes) {
    throw new FileTooLargeError(
      `Remote media size (${Math.round(parseInt(contentLength, 10) / (1024 * 1024))}MB) exceeds maximum allowable limit of ${config.MAX_FILE_SIZE_MB}MB.`
    );
  }

  const fileHandle = await fs.open(targetPath, 'w');
  const writableStream = fileHandle.createWriteStream();

  let bytesReceived = 0;

  if (res.body) {
    const reader = res.body.getReader();
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        bytesReceived += value.byteLength;
        if (bytesReceived > maxBytes) {
          throw new FileTooLargeError(
            `Download stream exceeded maximum allowable limit of ${config.MAX_FILE_SIZE_MB}MB.`
          );
        }

        if (!writableStream.write(value)) {
          await new Promise((resolve) => writableStream.once('drain', resolve));
        }
      }
    } finally {
      writableStream.end();
      await new Promise((resolve) => writableStream.once('finish', resolve));
      await fileHandle.close();
    }
  } else {
    await fileHandle.close();
  }
}
