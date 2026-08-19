import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  AppError,
  ErrorCodes,
  InvalidUrlError,
  UnsupportedPlatformError,
  UnsupportedMediaError,
  AuthorizationRequiredError,
  ProviderUnavailableError,
  MediaUnavailableError,
  ProcessingFailedError,
  FileTooLargeError,
  ProcessingTimeoutError,
  RateLimitedError
} from '../src/utils/errors.js';

describe('AppError Hierarchy & Error Codes', () => {
  test('AppError sets operational flags and status codes', () => {
    const err = new AppError('TEST_CODE', 'A test message', 418, { sample: true });
    assert.equal(err.code, 'TEST_CODE');
    assert.equal(err.message, 'A test message');
    assert.equal(err.statusCode, 418);
    assert.equal(err.isOperational, true);
    assert.deepEqual(err.details, { sample: true });
  });

  test('Subclasses inherit appropriate HTTP status codes and standard codes', () => {
    const cases = [
      { error: new InvalidUrlError(), code: ErrorCodes.INVALID_URL, status: 400 },
      { error: new UnsupportedPlatformError(), code: ErrorCodes.UNSUPPORTED_PLATFORM, status: 400 },
      { error: new UnsupportedMediaError(), code: ErrorCodes.UNSUPPORTED_MEDIA, status: 400 },
      { error: new AuthorizationRequiredError(), code: ErrorCodes.AUTHORIZATION_REQUIRED, status: 403 },
      { error: new ProviderUnavailableError(), code: ErrorCodes.PROVIDER_UNAVAILABLE, status: 503 },
      { error: new MediaUnavailableError(), code: ErrorCodes.MEDIA_UNAVAILABLE, status: 404 },
      { error: new ProcessingFailedError(), code: ErrorCodes.PROCESSING_FAILED, status: 500 },
      { error: new FileTooLargeError(), code: ErrorCodes.FILE_TOO_LARGE, status: 413 },
      { error: new ProcessingTimeoutError(), code: ErrorCodes.PROCESSING_TIMEOUT, status: 504 },
      { error: new RateLimitedError(), code: ErrorCodes.RATE_LIMITED, status: 429 }
    ];

    for (const { error, code, status } of cases) {
      assert.ok(error instanceof AppError);
      assert.equal(error.code, code);
      assert.equal(error.statusCode, status);
      assert.equal(error.isOperational, true);
    }
  });
});
