import { AppError, ErrorCodes } from '../utils/errors.js';
import { logger } from '../utils/logger.js';
import { config } from '../config/config.js';

export function errorMiddleware(err, req, res, _next) {
  // If it's a known operational AppError
  if (err instanceof AppError) {
    logger.warn({
      errName: err.name,
      code: err.code,
      message: err.message,
      statusCode: err.statusCode,
      path: req.originalUrl,
      method: req.method
    }, 'Operational error handled');

    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        ...(config.isDevelopment && err.details ? { details: err.details } : {})
      }
    });
  }

  // If it's a CORS error
  if (err.message && err.message.startsWith('CORS blocked')) {
    logger.warn({ message: err.message }, 'CORS restriction triggered');
    return res.status(403).json({
      success: false,
      error: {
        code: 'FORBIDDEN_ORIGIN',
        message: 'Cross-origin request blocked by security policy.'
      }
    });
  }

  // Catch-all unhandled server error
  logger.error({
    err: {
      message: err.message,
      stack: err.stack
    },
    path: req.originalUrl,
    method: req.method
  }, 'Unhandled internal server error');

  return res.status(500).json({
    success: false,
    error: {
      code: ErrorCodes.UNKNOWN_ERROR,
      message: 'An unexpected internal error occurred. Please try again later.'
    }
  });
}
