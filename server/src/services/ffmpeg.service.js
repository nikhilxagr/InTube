import { spawn } from 'child_process';
import ffmpegStatic from 'ffmpeg-static';
import { config } from '../config/config.js';
import { ProcessingFailedError, ProcessingTimeoutError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

export class FFmpegService {
  constructor(customBinary = null, customProbe = null) {
    this.ffmpegBinary = customBinary || config.FFMPEG_PATH || ffmpegStatic || 'ffmpeg';
    this.ffprobeBinary = customProbe || 'ffprobe';
  }

  /**
   * Sanitizes a file path argument to prevent option injection.
   * If a path starts with a dash '-', prepends './' to prevent it from being parsed as an option.
   * @param {string} filePath
   * @returns {string}
   */
  sanitizePathArg(filePath) {
    if (typeof filePath !== 'string') {
      throw new ProcessingFailedError('File path argument must be a string.');
    }
    if (filePath.startsWith('-')) {
      return `./${filePath}`;
    }
    return filePath;
  }

  /**
   * Builds safe argument array for audio extraction / transcoding.
   * @param {string} inputPath
   * @param {string} outputPath
   * @param {object} [options={}]
   * @param {string} [options.container='mp3']
   * @param {string} [options.bitrate='320k']
   * @returns {string[]}
   */
  buildAudioExtractArgs(inputPath, outputPath, options = {}) {
    const container = options.container || 'mp3';
    const bitrate = options.bitrate || '320k';
    const safeIn = this.sanitizePathArg(inputPath);
    const safeOut = this.sanitizePathArg(outputPath);

    if (container === 'mp3') {
      return [
        '-y',
        '-i',
        safeIn,
        '-vn',
        '-c:a',
        'libmp3lame',
        '-b:a',
        bitrate,
        '-id3v2_version',
        '3',
        safeOut
      ];
    }

    // Default AAC / M4A
    return [
      '-y',
      '-i',
      safeIn,
      '-vn',
      '-c:a',
      'aac',
      '-b:a',
      bitrate === '320k' ? '192k' : bitrate,
      safeOut
    ];
  }

  /**
   * Builds safe argument array for video conversion / normalization.
   * @param {string} inputPath
   * @param {string} outputPath
   * @param {object} [options={}]
   * @param {string} [options.preset='fast']
   * @param {string} [options.crf='22']
   * @returns {string[]}
   */
  buildVideoConvertArgs(inputPath, outputPath, options = {}) {
    const preset = options.preset || 'fast';
    const crf = options.crf || '22';
    const safeIn = this.sanitizePathArg(inputPath);
    const safeOut = this.sanitizePathArg(outputPath);

    return [
      '-y',
      '-i',
      safeIn,
      '-c:v',
      'libx264',
      '-preset',
      preset,
      '-crf',
      crf,
      '-c:a',
      'aac',
      '-b:a',
      '128k',
      '-movflags',
      '+faststart',
      safeOut
    ];
  }

  /**
   * Builds safe argument array for fast video-audio stream muxing.
   * @param {string} videoPath
   * @param {string} audioPath
   * @param {string} outputPath
   * @returns {string[]}
   */
  buildVideoAudioMuxArgs(videoPath, audioPath, outputPath) {
    const safeVid = this.sanitizePathArg(videoPath);
    const safeAud = this.sanitizePathArg(audioPath);
    const safeOut = this.sanitizePathArg(outputPath);

    return [
      '-y',
      '-i',
      safeVid,
      '-i',
      safeAud,
      '-c:v',
      'copy',
      '-c:a',
      'aac',
      '-b:a',
      '128k',
      '-movflags',
      '+faststart',
      safeOut
    ];
  }

  /**
   * Builds safe argument array for container remuxing without re-encoding.
   * @param {string} inputPath
   * @param {string} outputPath
   * @returns {string[]}
   */
  buildRemuxArgs(inputPath, outputPath) {
    const safeIn = this.sanitizePathArg(inputPath);
    const safeOut = this.sanitizePathArg(outputPath);

    return [
      '-y',
      '-i',
      safeIn,
      '-c',
      'copy',
      '-movflags',
      '+faststart',
      safeOut
    ];
  }

  /**
   * Executes an FFmpeg command with safe argument arrays, zero shell interpolation, and timeouts.
   * @param {string[]} args - FFmpeg CLI arguments array (NEVER a concatenated shell string)
   * @param {object} [options={}]
   * @param {number} [options.timeout]
   * @returns {Promise<void>}
   */
  async execute(args, options = {}) {
    if (!Array.isArray(args) || args.some((arg) => typeof arg !== 'string')) {
      throw new ProcessingFailedError('FFmpeg arguments must be an array of discrete strings.');
    }

    const timeoutMs = options.timeout || config.MAX_PROCESSING_TIME_MS;

    return new Promise((resolve, reject) => {
      let isSettled = false;

      logger.debug({ binary: this.ffmpegBinary, args }, 'Spawning FFmpeg process');

      // Spawn with shell: false strictly enforced
      const processInstance = spawn(this.ffmpegBinary, args, {
        windowsHide: true,
        shell: false
      });

      let stderrOutput = '';

      if (processInstance.stderr) {
        processInstance.stderr.on('data', (chunk) => {
          stderrOutput += chunk.toString();
        });
      }

      const timer = setTimeout(() => {
        if (!isSettled) {
          isSettled = true;
          try {
            processInstance.kill('SIGKILL');
          } catch {
            // Process may have already exited
          }
          reject(new ProcessingTimeoutError(`FFmpeg operation exceeded timeout limit of ${timeoutMs}ms.`));
        }
      }, timeoutMs);

      processInstance.on('error', (err) => {
        if (!isSettled) {
          isSettled = true;
          clearTimeout(timer);
          logger.error({ err, stderr: stderrOutput }, 'FFmpeg execution error');
          reject(new ProcessingFailedError(`Failed to start FFmpeg process: ${err.message}`));
        }
      });

      processInstance.on('close', (code) => {
        if (!isSettled) {
          isSettled = true;
          clearTimeout(timer);
          if (code === 0) {
            resolve();
          } else {
            logger.error({ exitCode: code, stderr: stderrOutput }, 'FFmpeg exited with non-zero code');
            reject(new ProcessingFailedError(`FFmpeg exited with error code ${code}`));
          }
        }
      });
    });
  }

  /**
   * Extracts audio stream to MP3 or M4A container.
   * @param {string} inputPath
   * @param {string} outputPath
   * @param {object} [options={}]
   * @returns {Promise<void>}
   */
  async extractAudio(inputPath, outputPath, options = {}) {
    const args = this.buildAudioExtractArgs(inputPath, outputPath, options);
    await this.execute(args, options);
  }

  /**
   * Transcodes video stream to optimized MP4 format.
   * @param {string} inputPath
   * @param {string} outputPath
   * @param {object} [options={}]
   * @returns {Promise<void>}
   */
  async convertVideo(inputPath, outputPath, options = {}) {
    const args = this.buildVideoConvertArgs(inputPath, outputPath, options);
    await this.execute(args, options);
  }

  /**
   * Muxes separate video and audio streams together.
   * @param {string} videoPath
   * @param {string} audioPath
   * @param {string} outputPath
   * @param {object} [options={}]
   * @returns {Promise<void>}
   */
  async muxVideoAudio(videoPath, audioPath, outputPath, options = {}) {
    const args = this.buildVideoAudioMuxArgs(videoPath, audioPath, outputPath);
    await this.execute(args, options);
  }

  /**
   * Fast container remux without re-encoding.
   * @param {string} inputPath
   * @param {string} outputPath
   * @param {object} [options={}]
   * @returns {Promise<void>}
   */
  async remux(inputPath, outputPath, options = {}) {
    const args = this.buildRemuxArgs(inputPath, outputPath);
    await this.execute(args, options);
  }
}

export const ffmpegService = new FFmpegService();
