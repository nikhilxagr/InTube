import { ErrorCodes } from '../utils/errors.js';

export function notFoundMiddleware(req, res) {
  res.status(404).json({
    success: false,
    error: {
      code: ErrorCodes.NOT_FOUND,
      message: `Route not found: ${req.method} ${req.originalUrl}`
    }
  });
}
