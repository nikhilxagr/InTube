import crypto from 'crypto';
import { config } from '../config/config.js';
import { cleanupService } from './cleanup.service.js';
import { TransferExpiredError, TransferNotFoundError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

export class TransferService {
  constructor() {
    /** @type {Map<string, object>} */
    this.transfers = new Map();

    // Periodic sweep for expired transfers
    this.sweepInterval = globalThis.setInterval(() => this.cleanupExpiredTransfers(), 30000);
    if (this.sweepInterval.unref) {
      this.sweepInterval.unref();
    }
  }

  /**
   * Creates a new cryptographically secure ephemeral transfer token for a file.
   * @param {object} params
   * @param {string} params.filePath
   * @param {string} params.jobDir
   * @param {string} params.filename
   * @param {string} [params.mimeType]
   * @param {number} [params.size]
   * @param {string} [params.title]
   * @param {number} [params.expirationSeconds]
   * @returns {object} { token, expiresAt, filename, size, mimeType }
   */
  createTransfer({
    filePath,
    jobDir,
    filename,
    mimeType = 'application/octet-stream',
    size = 0,
    title = 'Media Transfer',
    expirationSeconds = config.TRANSFER_EXPIRATION_SECONDS
  }) {
    // Generate 64-char cryptographically random token
    const token = crypto.randomBytes(32).toString('hex');
    const now = Date.now();
    const expiresAt = now + (expirationSeconds * 1000);

    const record = {
      token,
      filePath,
      jobDir,
      filename,
      mimeType,
      size,
      title,
      createdAt: now,
      expiresAt,
      consumed: false,
      downloadsCount: 0
    };

    this.transfers.set(token, record);
    logger.info({ token, filename, expiresAt: new Date(expiresAt).toISOString() }, 'Created ephemeral transfer token');

    return {
      token,
      expiresAt,
      filename,
      size,
      mimeType,
      title
    };
  }

  /**
   * Retrieves public sanitized transfer metadata for the phone landing page.
   * @param {string} token
   * @returns {object}
   */
  getTransferInfo(token) {
    if (!token || typeof token !== 'string' || token.length !== 64) {
      throw new TransferNotFoundError('Invalid transfer token format.');
    }

    const record = this.transfers.get(token);
    if (!record) {
      throw new TransferNotFoundError('Transfer record not found.');
    }

    const now = Date.now();
    if (now > record.expiresAt) {
      this.revokeTransfer(token).catch(() => {});
      throw new TransferExpiredError('This transfer link has expired. Please generate a new QR code.');
    }

    const remainingSeconds = Math.max(0, Math.round((record.expiresAt - now) / 1000));

    return {
      token: record.token,
      filename: record.filename,
      title: record.title,
      mimeType: record.mimeType,
      size: record.size,
      expiresAt: record.expiresAt,
      remainingSeconds
    };
  }

  /**
   * Retrieves the transfer record for downloading.
   * @param {string} token
   * @returns {object}
   */
  getTransferForDownload(token) {
    if (!token || typeof token !== 'string' || token.length !== 64) {
      throw new TransferNotFoundError('Invalid transfer token format.');
    }

    const record = this.transfers.get(token);
    if (!record) {
      throw new TransferNotFoundError('Transfer record not found.');
    }

    const now = Date.now();
    if (now > record.expiresAt) {
      this.revokeTransfer(token).catch(() => {});
      throw new TransferExpiredError('This transfer link has expired. Please generate a new QR code.');
    }

    record.downloadsCount += 1;
    return record;
  }

  /**
   * Revokes and cleans up a transfer record and its temporary directory.
   * @param {string} token
   */
  async revokeTransfer(token) {
    const record = this.transfers.get(token);
    if (!record) return;

    this.transfers.delete(token);

    if (record.jobDir) {
      logger.debug({ token, jobDir: record.jobDir }, 'Cleaning ephemeral transfer job directory');
      await cleanupService.cleanDirectory(record.jobDir).catch((err) => {
        logger.error({ err, token }, 'Failed cleaning transfer job directory');
      });
    }
  }

  /**
   * Sweeps expired transfers and executes filesystem cleanup.
   */
  async cleanupExpiredTransfers() {
    const now = Date.now();
    const expiredTokens = [];

    for (const [token, record] of this.transfers.entries()) {
      if (now > record.expiresAt) {
        expiredTokens.push(token);
      }
    }

    for (const token of expiredTokens) {
      logger.info({ token }, 'Purging expired transfer record');
      await this.revokeTransfer(token);
    }
  }
}

export const transferService = new TransferService();
