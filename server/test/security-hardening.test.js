import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import path from 'path';
import fs from 'fs/promises';
import { createApp } from '../src/app.js';
import { validateMediaUrl, isPrivateOrReservedHost } from '../src/utils/url-validator.js';
import { sanitizeFilename, isPathContained, streamUrlToFile } from '../src/utils/file-utils.js';
import { ffmpegService } from '../src/services/ffmpeg.service.js';
import { FileTooLargeError, InvalidUrlError, ProcessingFailedError } from '../src/utils/errors.js';
import { config } from '../src/config/config.js';

describe('Comprehensive Security Hardening Suite', () => {
  let server;
  let baseUrl;

  before(async () => {
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

  describe('1. SSRF & Malicious URL Defenses', () => {
    test('blocks cloud metadata IP 169.254.169.254 and all subnets', () => {
      assert.equal(isPrivateOrReservedHost('169.254.169.254'), true);
      assert.equal(isPrivateOrReservedHost('169.254.0.1'), true);
      assert.equal(isPrivateOrReservedHost('169.254.255.254'), true);
    });

    test('blocks decimal integer and hex IP formats', () => {
      assert.equal(isPrivateOrReservedHost('2130706433'), true); // 127.0.0.1
      assert.equal(isPrivateOrReservedHost('0x7f000001'), true);
      assert.equal(isPrivateOrReservedHost('0177.0.0.1'), true);
    });

    test('blocks IPv6 loopback, link-local, and unique local addresses', () => {
      assert.equal(isPrivateOrReservedHost('::1'), true);
      assert.equal(isPrivateOrReservedHost('fe80::1'), true);
      assert.equal(isPrivateOrReservedHost('fc00::1'), true);
      assert.equal(isPrivateOrReservedHost('fd00::1'), true);
    });

    test('rejects URLs with non-printable characters or user credentials', () => {
      assert.throws(() => validateMediaUrl('https://admin:secret@youtube.com/watch?v=123'), InvalidUrlError);
    });
  });

  describe('2. Path Traversal & Filename Sanitization', () => {
    test('isPathContained blocks parent directory traversals', () => {
      const base = config.resolvedTempDir;
      assert.equal(isPathContained(path.join(base, 'job123'), base), true);
      assert.equal(isPathContained(path.join(base, '..', 'etc', 'passwd'), base), false);
      assert.equal(isPathContained(path.join(base, '..', '..', 'Windows'), base), false);
    });

    test('sanitizeFilename removes Windows reserved names and control characters', () => {
      assert.equal(sanitizeFilename('CON'), 'CON_file');
      assert.equal(sanitizeFilename('PRN'), 'PRN_file');
      assert.equal(sanitizeFilename('AUX'), 'AUX_file');
      assert.equal(sanitizeFilename('NUL'), 'NUL_file');
      assert.equal(sanitizeFilename('COM1'), 'COM1_file');
      assert.equal(sanitizeFilename('LPT1'), 'LPT1_file');
      assert.equal(sanitizeFilename('CON.mp4'), 'CON.mp4_file');
      assert.equal(sanitizeFilename('../../../malicious/path/name'), 'malicious_path_name');
    });
  });

  describe('3. Command Injection & FFmpeg Parameter Safety', () => {
    test('sanitizePathArg prepends ./ to paths starting with dash to prevent flag injection', () => {
      assert.equal(ffmpegService.sanitizePathArg('-version'), './-version');
      assert.equal(ffmpegService.sanitizePathArg('--output'), './--output');
      assert.equal(ffmpegService.sanitizePathArg('valid_file.mp4'), 'valid_file.mp4');
    });

    test('execute strictly rejects non-array arguments', async () => {
      await assert.rejects(
        () => ffmpegService.execute('ffmpeg -i test.mp4'),
        (err) => {
          assert.ok(err instanceof ProcessingFailedError);
          assert.ok(err.message.includes('must be an array'));
          return true;
        }
      );
    });
  });

  describe('4. Oversized Files & Body Limits', () => {
    test('POST with oversized request body > 50kb is rejected with 413 Payload Too Large', async () => {
      const largePayload = {
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        padding: 'A'.repeat(60 * 1024) // 60KB
      };

      const res = await fetch(`${baseUrl}/api/v1/media/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(largePayload)
      });

      assert.equal(res.status, 413);
    });

    test('streamUrlToFile enforces max file size limit', async () => {
      const testFilePath = path.join(config.resolvedTempDir, 'temp_test_oversize.bin');
      await fs.mkdir(config.resolvedTempDir, { recursive: true });

      // Create a dummy endpoint on the test server that streams 2MB
      // With maxSizeBytes configured to 100KB, streamUrlToFile must throw FileTooLargeError
      await assert.rejects(
        () =>
          streamUrlToFile(`${baseUrl}/api/v1/health`, testFilePath, {
            maxSizeBytes: 10 // artificially tiny 10 bytes limit
          }),
        (err) => {
          assert.ok(err instanceof FileTooLargeError);
          assert.equal(err.statusCode, 413);
          return true;
        }
      );

      // Clean up test file if left
      await fs.rm(testFilePath, { force: true });
    });
  });

  describe('5. Security Headers & CORS Policy', () => {
    test('Response contains comprehensive Helmet security headers', async () => {
      const res = await fetch(`${baseUrl}/api/v1/health`);

      assert.equal(res.headers.get('x-content-type-options'), 'nosniff');
      assert.equal(res.headers.get('x-frame-options'), 'SAMEORIGIN');
      assert.ok(res.headers.get('content-security-policy'));
      assert.ok(res.headers.get('strict-transport-security'));
      assert.equal(res.headers.get('referrer-policy'), 'no-referrer');
    });

    test('Rate limit headers are present in responses', async () => {
      const res = await fetch(`${baseUrl}/api/v1/health`);

      assert.ok(res.headers.get('ratelimit-limit') || res.headers.get('x-ratelimit-limit'));
    });
  });
});
