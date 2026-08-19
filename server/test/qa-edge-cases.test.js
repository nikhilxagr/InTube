import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/app.js';
import { ErrorCodes, ProcessingTimeoutError } from '../src/utils/errors.js';
import { cleanupService } from '../src/services/cleanup.service.js';
import { providerRegistry } from '../src/providers/provider-registry.js';
import { ProviderInterface } from '../src/providers/provider.interface.js';

describe('QA Edge Cases & Error Resilience Suite', () => {
  let server;
  let baseUrl;

  // Mock timeout provider to verify 504 behavior
  class TimeoutMockProvider extends ProviderInterface {
    name = 'timeout-platform';
    canHandle(url) {
      return url.hostname === 'timeout-test.org';
    }
    validate(url) {
      return this.canHandle(url);
    }
    async getMetadata() {
      throw new ProcessingTimeoutError('Provider operation timed out after 120000ms.');
    }
    normalizeMetadata() {
      return {};
    }
    async processDownload() {
      throw new ProcessingTimeoutError('Processing pipeline timed out.');
    }
  }

  before(async () => {
    providerRegistry.register(new TimeoutMockProvider());

    const app = createApp();
    await new Promise((resolve) => {
      server = app.listen(0, '127.0.0.1', () => {
        const port = server.address().port;
        baseUrl = `http://127.0.0.1:${port}`;
        resolve();
      });
    });
  });

  after(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  test('POST /api/v1/media/analyze with oversized URL string (> 2048 chars) returns 400 INVALID_URL', async () => {
    const longUrl = `https://www.youtube.com/watch?v=dQw4w9WgXcQ&extra=${'x'.repeat(2100)}`;
    const res = await fetch(`${baseUrl}/api/v1/media/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: longUrl })
    });

    assert.equal(res.status, 400);
    const json = await res.json();
    assert.equal(json.success, false);
    assert.equal(json.error.code, ErrorCodes.INVALID_URL);
  });

  test('POST /api/v1/media/analyze with dangerous protocols (ftp, file, javascript) returns 400 INVALID_URL', async () => {
    const dangerous = [
      'ftp://example.com/video.mp4',
      'file:///etc/passwd',
      'javascript:alert(1)'
    ];

    for (const url of dangerous) {
      const res = await fetch(`${baseUrl}/api/v1/media/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });

      assert.equal(res.status, 400);
      const json = await res.json();
      assert.equal(json.success, false);
      assert.equal(json.error.code, ErrorCodes.INVALID_URL);
    }
  });

  test('POST /api/v1/media/analyze with unsupported platforms returns 400 UNSUPPORTED_PLATFORM', async () => {
    const unsupported = [
      'https://www.tiktok.com/@user/video/1234567890',
      'https://vimeo.com/123456789',
      'https://twitter.com/user/status/123456789',
      'https://www.facebook.com/watch/?v=123456789',
      'https://www.dailymotion.com/video/x123456'
    ];

    for (const url of unsupported) {
      const res = await fetch(`${baseUrl}/api/v1/media/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });

      assert.equal(res.status, 400);
      const json = await res.json();
      assert.equal(json.success, false);
      assert.equal(json.error.code, ErrorCodes.UNSUPPORTED_PLATFORM);
    }
  });

  test('POST /api/v1/media/analyze with timeout provider returns 504 PROCESSING_TIMEOUT', async () => {
    const res = await fetch(`${baseUrl}/api/v1/media/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: 'https://timeout-test.org/watch?v=123' })
    });

    assert.equal(res.status, 504);
    const json = await res.json();
    assert.equal(json.success, false);
    assert.equal(json.error.code, ErrorCodes.PROCESSING_TIMEOUT);
  });

  test('GET to non-existent route returns 404 with standardized error envelope', async () => {
    const res = await fetch(`${baseUrl}/api/v1/non-existent-endpoint-test`);
    assert.equal(res.status, 404);
    const json = await res.json();
    assert.equal(json.success, false);
    assert.equal(json.error.code, ErrorCodes.NOT_FOUND);
  });

  test('CleanupService sweep safely sweeps orphaned temp directories', async () => {
    const result = await cleanupService.sweepOrphanedTempDirs(0);
    assert.ok(typeof result.scanned === 'number');
    assert.ok(typeof result.removed === 'number');
  });
});
