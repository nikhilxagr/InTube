export const ErrorCodes = {
  INVALID_URL: 'INVALID_URL',
  UNSUPPORTED_PLATFORM: 'UNSUPPORTED_PLATFORM',
  UNSUPPORTED_MEDIA: 'UNSUPPORTED_MEDIA',
  AUTHORIZATION_REQUIRED: 'AUTHORIZATION_REQUIRED',
  PROVIDER_UNAVAILABLE: 'PROVIDER_UNAVAILABLE',
  MEDIA_UNAVAILABLE: 'MEDIA_UNAVAILABLE',
  PROCESSING_FAILED: 'PROCESSING_FAILED',
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  PROCESSING_TIMEOUT: 'PROCESSING_TIMEOUT',
  RATE_LIMITED: 'RATE_LIMITED',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR'
};

export class AppError extends Error {
  /**
   * @param {string} code - Standardized error code from ErrorCodes
   * @param {string} message - User-friendly error message
   * @param {number} statusCode - HTTP status code
   * @param {object} [details=null] - Optional sanitized metadata
   */
  constructor(code, message, statusCode = 400, details = null) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class InvalidUrlError extends AppError {
  constructor(message = 'The provided URL is invalid or unsupported.') {
    super(ErrorCodes.INVALID_URL, message, 400);
  }
}

export class UnsupportedPlatformError extends AppError {
  constructor(message = 'The platform for this URL is not currently supported.') {
    super(ErrorCodes.UNSUPPORTED_PLATFORM, message, 400);
  }
}

export class UnsupportedMediaError extends AppError {
  constructor(message = 'This specific media format or stream type is not supported.') {
    super(ErrorCodes.UNSUPPORTED_MEDIA, message, 400);
  }
}

export class AuthorizationRequiredError extends AppError {
  constructor(message = 'This media is private or requires authorization and cannot be accessed.') {
    super(ErrorCodes.AUTHORIZATION_REQUIRED, message, 403);
  }
}

export class ProviderUnavailableError extends AppError {
  constructor(message = 'The upstream provider is currently unavailable. Please try again later.') {
    super(ErrorCodes.PROVIDER_UNAVAILABLE, message, 503);
  }
}

export class MediaUnavailableError extends AppError {
  constructor(message = 'The requested media could not be found or has been removed.') {
    super(ErrorCodes.MEDIA_UNAVAILABLE, message, 404);
  }
}

export class ProcessingFailedError extends AppError {
  constructor(message = 'Media processing failed during transcoding or extraction.') {
    super(ErrorCodes.PROCESSING_FAILED, message, 500);
  }
}

export class FileTooLargeError extends AppError {
  constructor(message = 'The requested media exceeds the maximum permissible file size.') {
    super(ErrorCodes.FILE_TOO_LARGE, message, 413);
  }
}

export class ProcessingTimeoutError extends AppError {
  constructor(message = 'The media processing operation timed out.') {
    super(ErrorCodes.PROCESSING_TIMEOUT, message, 504);
  }
}

export class RateLimitedError extends AppError {
  constructor(message = 'Too many requests. Please slow down and try again later.') {
    super(ErrorCodes.RATE_LIMITED, message, 429);
  }
}
