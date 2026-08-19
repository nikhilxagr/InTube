import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import path from 'path';
import fs from 'fs/promises';
import { FFmpegService } from '../src/services/ffmpeg.service.js';
import { cleanupService } from '../src/services/cleanup.service.js';
import { createJobDirectory, isPathContained, sanitizeFilename } from '../src/utils/file-utils.js';
import { ProcessingFailedError, ProcessingTimeoutError } from '../src/utils/errors.js';
import { config } from '../src/config/config.js';

describe('FFmpeg Media Processing & Ephemeral Cleanup Service', () => {
  const service = new FFmpegService();

  describe('Safe CLI Argument Construction', () => {
    test('buildAudioExtractArgs creates discrete array arguments for MP3', () => {
      const args = service.buildAudioExtractArgs('input.mp4', 'output.mp3', {
        container: 'mp3',
        bitrate: '320k'
      });

      assert.ok(Array.isArray(args));
      assert.deepEqual(args, [
        '-y',
        '-i',
        'input.mp4',
        '-vn',
        '-c:a',
        'libmp3lame',
        '-b:a',
        '320k',
        '-id3v2_version',
        '3',
        'output.mp3'
      ]);
    });

    test('buildAudioExtractArgs creates discrete array arguments for M4A/AAC', () => {
      const args = service.buildAudioExtractArgs('input.mp4', 'output.m4a', {
        container: 'm4a',
        bitrate: '128k'
      });

      assert.ok(Array.isArray(args));
      assert.deepEqual(args, [
        '-y',
        '-i',
        'input.mp4',
        '-vn',
        '-c:a',
        'aac',
        '-b:a',
        '128k',
        'output.m4a'
      ]);
    });

    test('buildVideoConvertArgs includes faststart and x264 parameters', () => {
      const args = service.buildVideoConvertArgs('input.webm', 'output.mp4', {
        preset: 'medium',
        crf: '20'
      });

      assert.ok(Array.isArray(args));
      assert.deepEqual(args, [
        '-y',
        '-i',
        'input.webm',
        '-c:v',
        'libx264',
        '-preset',
        'medium',
        '-crf',
        '20',
        '-c:a',
        'aac',
        '-b:a',
        '128k',
        '-movflags',
        '+faststart',
        'output.mp4'
      ]);
    });

    test('buildVideoAudioMuxArgs uses copy stream for video', () => {
      const args = service.buildVideoAudioMuxArgs('video.mp4', 'audio.m4a', 'muxed.mp4');

      assert.deepEqual(args, [
        '-y',
        '-i',
        'video.mp4',
        '-i',
        'audio.m4a',
        '-c:v',
        'copy',
        '-c:a',
        'aac',
        '-b:a',
        '128k',
        '-movflags',
        '+faststart',
        'muxed.mp4'
      ]);
    });

    test('buildRemuxArgs creates zero re-encoding parameters', () => {
      const args = service.buildRemuxArgs('input.mkv', 'output.mp4');

      assert.deepEqual(args, [
        '-y',
        '-i',
        'input.mkv',
        '-c',
        'copy',
        '-movflags',
        '+faststart',
        'output.mp4'
      ]);
    });
  });

  describe('Process Execution, Failure & Timeout Handling', () => {
    test('execute throws ProcessingFailedError when binary does not exist', async () => {
      const faultyService = new FFmpegService('non-existent-ffmpeg-binary-path-xyz');

      await assert.rejects(
        () => faultyService.execute(['-version']),
        (err) => {
          assert.ok(err instanceof ProcessingFailedError);
          assert.equal(err.statusCode, 500);
          assert.equal(err.code, 'PROCESSING_FAILED');
          return true;
        }
      );
    });

    test('execute throws ProcessingTimeoutError when operation exceeds timeout', async () => {
      // Use node process as mock long-running binary with a very short timeout
      const mockService = new FFmpegService(process.execPath);

      await assert.rejects(
        () =>
          mockService.execute(
            ['-e', 'setTimeout(() => {}, 5000)'],
            { timeout: 50 }
          ),
        (err) => {
          assert.ok(err instanceof ProcessingTimeoutError);
          assert.equal(err.statusCode, 504);
          assert.equal(err.code, 'PROCESSING_TIMEOUT');
          return true;
        }
      );
    });

    test('execute throws ProcessingFailedError when process exits with non-zero code', async () => {
      const mockService = new FFmpegService(process.execPath);

      await assert.rejects(
        () => mockService.execute(['-e', 'process.exit(1)']),
        (err) => {
          assert.ok(err instanceof ProcessingFailedError);
          assert.equal(err.statusCode, 500);
          assert.equal(err.code, 'PROCESSING_FAILED');
          return true;
        }
      );
    });
  });

  describe('File Utilities & Directory Sanitization', () => {
    test('sanitizeFilename removes illegal path and header characters', () => {
      assert.equal(sanitizeFilename('Video / Title : "Cool" <Tag>? *'), 'Video_Title_Cool_Tag');
      assert.equal(sanitizeFilename(''), 'media');
      assert.equal(sanitizeFilename(null), 'media');
      assert.equal(sanitizeFilename('A'.repeat(200)).length, 100);
    });

    test('createJobDirectory and cleanupService safely manages ephemeral folders', async () => {
      const { jobId, jobDir } = await createJobDirectory();

      assert.ok(jobId);
      assert.ok(jobDir);
      assert.equal(isPathContained(jobDir, config.resolvedTempDir), true);

      // Create a test file inside the job directory
      const testFile = path.join(jobDir, 'test_media.mp4');
      await fs.writeFile(testFile, 'dummy binary content');

      const statBefore = await fs.stat(testFile);
      assert.ok(statBefore.isFile());

      // Clean directory
      await cleanupService.cleanDirectory(jobDir);

      // Verify deletion
      await assert.rejects(() => fs.stat(jobDir));
    });

    test('isPathContained blocks directory traversal attempts', () => {
      const baseDir = config.resolvedTempDir;
      assert.equal(isPathContained(path.join(baseDir, 'valid_job'), baseDir), true);
      assert.equal(isPathContained(path.join(baseDir, '..', 'server.js'), baseDir), false);
      assert.equal(isPathContained('C:\\Windows\\System32', baseDir), false);
    });
  });
});
