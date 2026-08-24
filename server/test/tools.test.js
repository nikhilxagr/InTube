import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import { createApp } from '../src/app.js';
import { transferService } from '../src/services/transfer.service.js';
import { ffmpegService } from '../src/services/ffmpeg.service.js';
import { createJobDirectory } from '../src/utils/file-utils.js';

import { tempFileManager } from '../src/services/temp-file-manager.service.js';

describe('Media Tools & QR Transfer Suite', () => {
  let server;
  let baseUrl;
  let testJobDir = null;
  let testFilePath = null;

  before(async () => {
    const app = createApp();
    await new Promise((resolve) => {
      server = app.listen(0, '127.0.0.1', () => {
        const port = server.address().port;
        baseUrl = `http://127.0.0.1:${port}`;
        resolve();
      });
    });

    const { jobDir } = await createJobDirectory();
    testJobDir = jobDir;
    testFilePath = path.join(jobDir, 'sample_test_media.mp4');
    await fs.promises.writeFile(testFilePath, 'dummy binary video content for transfer testing');
  });

  after(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
    if (testJobDir) {
      await fs.promises.rm(testJobDir, { recursive: true, force: true }).catch(() => {});
    }
    tempFileManager.stopPeriodicSweep();
    transferService.stopPeriodicSweep();
  });

  describe('FFmpeg Argument Builders', () => {
    it('builds valid MP3 audio extraction args', () => {
      const args = ffmpegService.buildAudioExtractArgs('/tmp/in.mp4', '/tmp/out.mp3', {
        container: 'mp3',
        bitrate: '320k'
      });
      assert.ok(args.includes('libmp3lame'));
      assert.ok(args.includes('320k'));
      assert.ok(args.includes('-vn'));
    });

    it('builds valid WAV lossless audio extraction args', () => {
      const args = ffmpegService.buildAudioExtractArgs('/tmp/in.mp4', '/tmp/out.wav', {
        container: 'wav'
      });
      assert.ok(args.includes('pcm_s16le'));
      assert.ok(args.includes('-vn'));
    });

    it('builds valid WebM video convert args', () => {
      const args = ffmpegService.buildVideoConvertArgs('/tmp/in.mov', '/tmp/out.webm', {
        format: 'webm',
        quality: 'balanced'
      });
      assert.ok(args.includes('libvpx'));
      assert.ok(args.includes('libvorbis'));
    });

    it('builds valid MP4 video convert args with faststart', () => {
      const args = ffmpegService.buildVideoConvertArgs('/tmp/in.avi', '/tmp/out.mp4', {
        format: 'mp4',
        quality: 'high'
      });
      assert.ok(args.includes('libx264'));
      assert.ok(args.includes('+faststart'));
    });
  });

  describe('TransferService Cryptographic Token Validation', () => {
    it('creates 64-character unguessable hex tokens with valid expiration', () => {
      const transfer = transferService.createTransfer({
        filePath: testFilePath,
        jobDir: testJobDir,
        filename: 'sample_test_media.mp4',
        mimeType: 'video/mp4',
        size: 48,
        expirationSeconds: 600
      });

      assert.strictEqual(transfer.token.length, 64);
      assert.match(transfer.token, /^[a-f0-9]{64}$/);
      assert.ok(transfer.expiresAt > Date.now());

      const info = transferService.getTransferInfo(transfer.token);
      assert.strictEqual(info.filename, 'sample_test_media.mp4');
      assert.ok(info.remainingSeconds > 0);
    });

    it('rejects invalid or forged transfer tokens with error', () => {
      assert.throws(() => {
        transferService.getTransferInfo('invalid_short_token');
      }, /Invalid transfer token format|not found/);

      assert.throws(() => {
        transferService.getTransferInfo('0000000000000000000000000000000000000000000000000000000000000000');
      }, /not found/);
    });
  });

  describe('Tools HTTP Endpoints', () => {
    it('GET /api/v1/transfer/:token returns transfer metadata for valid token', async () => {
      const transfer = transferService.createTransfer({
        filePath: testFilePath,
        jobDir: testJobDir,
        filename: 'video_transfer.mp4',
        mimeType: 'video/mp4',
        size: 100
      });

      const res = await fetch(`${baseUrl}/api/v1/transfer/${transfer.token}`);
      assert.strictEqual(res.status, 200);

      const json = await res.json();
      assert.strictEqual(json.success, true);
      assert.strictEqual(json.data.filename, 'video_transfer.mp4');
    });

    it('GET /api/v1/transfer/:token/download streams the file payload', async () => {
      const transfer = transferService.createTransfer({
        filePath: testFilePath,
        jobDir: testJobDir,
        filename: 'download_phone_test.mp4',
        mimeType: 'video/mp4',
        size: 48
      });

      const res = await fetch(`${baseUrl}/api/v1/transfer/${transfer.token}/download`);
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.headers.get('content-type'), 'video/mp4');
      assert.ok(res.headers.get('content-disposition').includes('download_phone_test.mp4'));
    });

    it('POST /api/v1/tools/thumbnail validates URL parameter', async () => {
      const res = await fetch(`${baseUrl}/api/v1/tools/thumbnail`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: 'not-a-valid-url' })
      });

      assert.strictEqual(res.status, 400);
      const json = await res.json();
      assert.strictEqual(json.success, false);
    });
  });
});
