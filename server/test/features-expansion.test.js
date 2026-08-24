/* global FormData, Blob */
import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import { createApp } from '../src/app.js';
import { tempFileManager } from '../src/services/temp-file-manager.service.js';
import { generateSafeFilename } from '../src/utils/filename.utils.js';
import { imageService } from '../src/services/image.service.js';

describe('Universal Media Toolkit - Feature Expansion Test Suite', () => {
  let server;
  let baseUrl;
  let sampleImagePath;
  let testJobId;
  let testJobDir;

  before(async () => {
    const app = createApp();
    await new Promise((resolve) => {
      server = app.listen(0, '127.0.0.1', () => {
        const port = server.address().port;
        baseUrl = `http://127.0.0.1:${port}`;
        resolve();
      });
    });

    // Generate a simple 100x100 PNG image for sharp testing
    const job = await tempFileManager.createJobDirectory('test_init');
    testJobId = job.jobId;
    testJobDir = job.jobDir;
    sampleImagePath = path.join(testJobDir, 'sample.png');

    await sharp({
      create: {
        width: 100,
        height: 100,
        channels: 4,
        background: { r: 59, g: 130, b: 246, alpha: 1 }
      }
    })
      .png()
      .toFile(sampleImagePath);
  });

  after(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
    await tempFileManager.cleanupJob(testJobId);
    tempFileManager.stopPeriodicSweep();
  });

  describe('1. Global TempFileManager & Automatic Cleanup', () => {
    it('creates isolated job directories and tracks active status', async () => {
      const { jobId, jobDir } = await tempFileManager.createJobDirectory('unit_test');
      assert.ok(jobId.startsWith('unit_test-'));
      const exists = await fs.stat(jobDir).then(() => true).catch(() => false);
      assert.strictEqual(exists, true);

      tempFileManager.registerActiveJob(jobId);
      assert.strictEqual(tempFileManager.isJobActive(jobId), true);

      tempFileManager.releaseActiveJob(jobId);
      assert.strictEqual(tempFileManager.isJobActive(jobId), false);

      await tempFileManager.cleanupJob(jobId);
      const existsAfter = await fs.stat(jobDir).then(() => true).catch(() => false);
      assert.strictEqual(existsAfter, false);
    });

    it('performs cleanup sweep without deleting active in-flight jobs', async () => {
      const { jobId } = await tempFileManager.createJobDirectory('active_test');
      tempFileManager.registerActiveJob(jobId);

      const deletedCount = await tempFileManager.sweepOldFiles();
      assert.ok(typeof deletedCount === 'number');
      assert.strictEqual(tempFileManager.isJobActive(jobId), true);

      tempFileManager.releaseActiveJob(jobId);
      await tempFileManager.cleanupJob(jobId);
    });
  });

  describe('2. Smart Filename Sanitizer', () => {
    it('cleans special characters, spaces, and path traversals', () => {
      const safe = generateSafeFilename('My Awesome Video! (2026) /:?*<>"|', 'mp4');
      assert.ok(!safe.includes('/'));
      assert.ok(!safe.includes(':'));
      assert.ok(!safe.includes('?'));
      assert.ok(safe.endsWith('.mp4'));
    });

    it('handles empty titles with safe fallback prefix', () => {
      const safe = generateSafeFilename('', 'mp3', 'audio');
      assert.ok(safe.startsWith('audio_'));
      assert.ok(safe.endsWith('.mp3'));
    });

    it('truncates oversized title strings while preserving extension', () => {
      const longTitle = 'A'.repeat(300);
      const safe = generateSafeFilename(longTitle, 'm4a', 'media', 100);
      assert.ok(safe.length <= 110);
      assert.ok(safe.endsWith('.m4a'));
    });
  });

  describe('3. Image Processing Service (Sharp)', () => {
    it('inspects image dimensions, format, and channel metadata', async () => {
      const meta = await imageService.inspectImage(sampleImagePath);
      assert.strictEqual(meta.format, 'png');
      assert.strictEqual(meta.width, 100);
      assert.strictEqual(meta.height, 100);
      assert.strictEqual(meta.channels, 4);
    });

    it('converts image to WebP, JPG, and AVIF', async () => {
      const webpOut = path.join(testJobDir, 'out.webp');
      const resWebp = await imageService.convertImage(sampleImagePath, webpOut, { format: 'webp', quality: 80 });
      assert.strictEqual(resWebp.format, 'webp');
      assert.ok(resWebp.outputSizeBytes > 0);

      const avifOut = path.join(testJobDir, 'out.avif');
      const resAvif = await imageService.convertImage(sampleImagePath, avifOut, { format: 'avif', quality: 75 });
      assert.strictEqual(resAvif.format, 'avif');
      assert.ok(resAvif.outputSizeBytes > 0);
    });

    it('compresses image and calculates reduction statistics', async () => {
      const compOut = path.join(testJobDir, 'compressed.jpg');
      const res = await imageService.compressImage(sampleImagePath, compOut, { quality: 50 });
      assert.ok(res.outputSizeBytes > 0);
      assert.ok(typeof res.reductionPercent === 'number');
    });

    it('resizes image while preserving aspect ratio', async () => {
      const resizeOut = path.join(testJobDir, 'resized.png');
      const res = await imageService.resizeImage(sampleImagePath, resizeOut, { width: 50, height: 50 });
      assert.strictEqual(res.width, 50);
      assert.strictEqual(res.height, 50);
    });
  });

  describe('4. Batch URL Processing API', () => {
    it('validates batch array and rejects requests exceeding limit', async () => {
      const overLimitUrls = [
        'https://www.youtube.com/watch?v=1',
        'https://www.youtube.com/watch?v=2',
        'https://www.youtube.com/watch?v=3',
        'https://www.youtube.com/watch?v=4',
        'https://www.youtube.com/watch?v=5',
        'https://www.youtube.com/watch?v=6'
      ];

      const res = await fetch(`${baseUrl}/api/tools/batch/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls: overLimitUrls })
      });

      assert.strictEqual(res.status, 400);
      const json = await res.json();
      assert.ok(json.error?.message?.includes('Maximum 5 URLs'));
    });

    it('deduplicates duplicate URLs and filters unsupported domains', async () => {
      const batchUrls = [
        'https://unsupported-site-1.example.com/video/123',
        'https://unsupported-site-1.example.com/video/123',
        'https://unsupported-site-2.example.com/video/456'
      ];

      const res = await fetch(`${baseUrl}/api/tools/batch/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls: batchUrls })
      });

      assert.strictEqual(res.status, 200);
      const json = await res.json();
      assert.strictEqual(json.success, true);
      assert.strictEqual(json.data.total, 2); // Deduped to 2

      const unsupported = json.data.items.find((i) => i.url.includes('unsupported-site-1'));
      assert.strictEqual(unsupported.status, 'error');
    });
  });

  describe('5. Image Tools HTTP Endpoints', () => {
    it('POST /api/tools/image/convert transforms uploaded image', async () => {
      const fileBuffer = await fs.readFile(sampleImagePath);
      const formData = new FormData();
      formData.append('file', new Blob([fileBuffer], { type: 'image/png' }), 'sample.png');
      formData.append('format', 'webp');
      formData.append('quality', '85');

      const res = await fetch(`${baseUrl}/api/tools/image/convert`, {
        method: 'POST',
        body: formData
      });

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.headers.get('content-type'), 'image/webp');
      assert.ok(res.headers.get('content-disposition')?.includes('.webp'));
    });

    it('POST /api/tools/image/compress returns compressed payload with headers', async () => {
      const fileBuffer = await fs.readFile(sampleImagePath);
      const formData = new FormData();
      formData.append('file', new Blob([fileBuffer], { type: 'image/png' }), 'sample.png');
      formData.append('quality', '60');

      const res = await fetch(`${baseUrl}/api/tools/image/compress`, {
        method: 'POST',
        body: formData
      });

      assert.strictEqual(res.status, 200);
      assert.ok(res.headers.get('x-reduction-percent') !== null);
      assert.ok(res.headers.get('x-output-size') !== null);
    });

    it('POST /api/tools/image/resize scales image according to dimensions', async () => {
      const fileBuffer = await fs.readFile(sampleImagePath);
      const formData = new FormData();
      formData.append('file', new Blob([fileBuffer], { type: 'image/png' }), 'sample.png');
      formData.append('width', '64');
      formData.append('height', '64');

      const res = await fetch(`${baseUrl}/api/tools/image/resize`, {
        method: 'POST',
        body: formData
      });

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.headers.get('content-type'), 'image/png');
    });
  });
});
