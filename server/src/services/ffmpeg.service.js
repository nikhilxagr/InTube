import { spawn } from 'child_process';
import { config } from '../config/config.js';
import { ProcessingFailedError, ProcessingTimeoutError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

export class FFmpegService {
  constructor() {
    this.ffmpegBinary = config.FFMPEG_PATH || 'ffmpeg';
  }

  /**
   * Executes an FFmpeg command with safe argument arrays and timeouts.
   * @param {string[]} args - FFmpeg CLI arguments array (NEVER a concatenated shell string)
   * @param {object} [options={}]
   * @param {number} [options.timeout]
   * @returns {Promise<void>}
   */
  async execute(args, options = {}) {
    const timeoutMs = options.timeout || config.MAX_PROCESSING_TIME_MS;

    return new Promise((resolve, reject) => {
      let isSettled = false;

      logger.debug({ binary: this.ffmpegBinary, args }, 'Spawning FFmpeg process');

      const processInstance = spawn(this.ffmpegBinary, args, {
        windowsHide: true
      });

      let stderrOutput = '';

      processInstance.stderr.on('data', (chunk) => {
        stderrOutput += chunk.toString();
      });

      const timer = setTimeout(() => {
        if (!isSettled) {
          isSettled = true;
          processInstance.kill('SIGKILL');
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
            reject(new ProcessingFailedError(`FFmpeg exited with code ${code}`));
          }
        }
      });
    });
  }
}

export const ffmpegService = new FFmpegService();
