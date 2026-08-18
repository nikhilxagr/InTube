import rateLimit from 'express-rate-limit';
import { config } from '../config/config.js';
import { ErrorCodes } from '../utils/errors.js';

const createRateLimiter = ({ windowMs, max, message }) => {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        success: false,
        error: {
          code: ErrorCodes.RATE_LIMITED,
          message: message || 'Too many requests. Please try again later.'
        }
      });
    }
  });
};

export const globalRateLimiter = createRateLimiter({
  windowMs: config.RATE_LIMIT_WINDOW_MS,
  max: config.RATE_LIMIT_MAX_REQUESTS,
  message: 'Global rate limit exceeded. Please wait a few minutes before retrying.'
});

export const analyzeRateLimiter = createRateLimiter({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 30,
  message: 'Too many analysis requests. Please wait a moment before analyzing more URLs.'
});

export const downloadRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: config.DOWNLOAD_RATE_LIMIT_MAX,
  message: 'Download rate limit reached. Please wait before requesting additional media.'
});
