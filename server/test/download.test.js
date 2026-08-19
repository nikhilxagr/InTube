import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import path from 'path';
import fs from 'fs/promises';
import { createApp } from '../src/app.js';
import { providerRegistry } from '../src/providers/provider-registry.js';
import { ProviderInterface } from '../src/providers/provider.interface.js';
import { ErrorCodes } from '../src/utils/errors.js';

describe('Complete Download Pipeline & Guaranteed Cleanup', () => {
  let server;
  let baseUrl;
  let lastJobDir = null;

  // Custom mock test provider that creates real temporary files to test the end-to-end stream + cleanup
  class TestMockProvider extends ProviderInterface {
    name = 'test-download-platform';

    canHandle(url) {
      return url.hostname === 'test-media-mock.org';
    }

    validate(url) {
      return this.canHandle(url);
    }

    async getMetadata(url) {
      return {
        id: 'sample123',
        url: url.href,
        type: 'video',
        title: 'Mock Test Video',
        author: 'Mock Author'
      };
    }

    normalizeMetadata(raw) {
      return {
        platform: this.name,
        ...raw,
        formats: [{ formatId: 'video_720p', container: 'mp4', quality: '720p' }]
      };
    }

    async processDownload(options) {
      const { jobDir, container = 'mp4' } = options;
      lastJobDir = jobDir;

      const dummyFilePath = path.join(jobDir, `sample_video.${container}`);
      await fs.writeFile(dummyFilePath, Buffer.from('FAKE BINARY MP4 VIDEO STREAM PAYLOAD FOR TESTING'));

      return {
        filePath: dummyFilePath,
        filename: `Mock_Test_Video.${container}`,
        mimeType: 'video/mp4'
      };
    }
  }

  before(async () => {
    providerRegistry.register(new TestMockProvider());

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

  test('POST /api/v1/media/download validates required parameters', async () => {
    const res = await fetch(`${baseUrl}/api/v1/media/download`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });

    assert.equal(res.status, 400);
    const json = await res.json();
    assert.equal(json.success, false);
    assert.equal(json.error.code, ErrorCodes.INVALID_URL);
  });

  test('POST /api/v1/media/download rejects SSRF targets', async () => {
    const res = await fetch(`${baseUrl}/api/v1/media/download`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: 'https://169.254.169.254/latest/meta-data',
        formatId: 'video_720p'
      })
    });

    assert.equal(res.status, 400);
    const json = await res.json();
    assert.equal(json.success, false);
    assert.equal(json.error.code, ErrorCodes.INVALID_URL);
  });

  test('POST /api/v1/media/download rejects unsupported platforms', async () => {
    const res = await fetch(`${baseUrl}/api/v1/media/download`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: 'https://vimeo.com/987654321',
        formatId: 'video_720p'
      })
    });

    assert.equal(res.status, 400);
    const json = await res.json();
    assert.equal(json.success, false);
    assert.equal(json.error.code, ErrorCodes.UNSUPPORTED_PLATFORM);
  });

  test('POST /api/v1/media/download streams binary payload and performs guaranteed cleanup', async () => {
    const res = await fetch(`${baseUrl}/api/v1/media/download`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: 'https://test-media-mock.org/watch?v=sample123',
        formatId: 'video_720p',
        container: 'mp4',
        type: 'video'
      })
    });

    assert.equal(res.status, 200);

    // Verify binary headers
    assert.equal(res.headers.get('content-type'), 'video/mp4');
    assert.ok(res.headers.get('content-disposition').includes('attachment'));
    assert.ok(res.headers.get('content-disposition').includes('Mock_Test_Video.mp4'));
    assert.ok(parseInt(res.headers.get('content-length'), 10) > 0);
    assert.equal(res.headers.get('cache-control'), 'no-store, no-cache, must-revalidate, proxy-revalidate');

    const arrayBuffer = await res.arrayBuffer();
    const content = Buffer.from(arrayBuffer).toString();
    assert.equal(content, 'FAKE BINARY MP4 VIDEO STREAM PAYLOAD FOR TESTING');

    // Wait a brief tick for the 'finish' event to complete filesystem deletion
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Verify that the ephemeral job directory has been reliably purged
    assert.ok(lastJobDir, 'Expected lastJobDir to have been populated');
    await assert.rejects(
      () => fs.stat(lastJobDir),
      'Expected ephemeral job directory to be deleted upon stream completion.'
    );
  });
});
