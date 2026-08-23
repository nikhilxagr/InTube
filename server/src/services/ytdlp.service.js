import { spawn } from 'child_process';
import { existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import ffmpegStatic from 'ffmpeg-static';
import { config } from '../config/config.js';
import { MediaUnavailableError, ProcessingFailedError, ProcessingTimeoutError, UnsupportedMediaError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class YtDlpService {
  constructor() {
    const isWindows = process.platform === 'win32';
    const bundledBin = path.resolve(__dirname, `../../bin/${isWindows ? 'yt-dlp.exe' : 'yt-dlp'}`);

    if (existsSync(bundledBin)) {
      this.binary = bundledBin;
    } else {
      this.binary = config.YTDLP_PATH || 'yt-dlp';
    }

    this.ffmpegBinary = config.FFMPEG_PATH || ffmpegStatic || 'ffmpeg';
  }

  getBaseArgs() {
    const args = [
      '--no-playlist',
      '--no-warnings',
      '--extractor-args', 'youtube:player_skip=configs,webpage;player_client=android,android_vr,ios',
      '--user-agent', 'com.google.android.youtube/19.29.37 (Linux; U; Android 14; US) gzip',
      '--socket-timeout', '30',
      '--retries', '3',
      '--no-check-certificates'
    ];

    if (this.ffmpegBinary && existsSync(this.ffmpegBinary)) {
      args.push('--ffmpeg-location', this.ffmpegBinary);
    }

    return args;
  }

  run(args, opts = {}) {
    const timeoutMs = opts.timeout || config.MAX_PROCESSING_TIME_MS;

    return new Promise((resolve, reject) => {
      let settled = false;
      let stdout = '';
      let stderr = '';

      if (!Array.isArray(args) || args.some((a) => typeof a !== 'string')) {
        return reject(new ProcessingFailedError('yt-dlp arguments must be an array of strings.'));
      }

      logger.debug({ binary: this.binary, args }, 'Spawning yt-dlp process');

      const proc = spawn(this.binary, args, {
        windowsHide: true,
        shell: false,
        env: { ...process.env }
      });

      const progressRegex = /\[download\]\s+([\d\.]+)%\s+of\s+~?\s*([\d\.]+[A-Za-z]+)\s+at\s+([^\s]+)(?:\s+ETA\s+([^\s]+))?/;
      const mergerRegex = /\[(?:Merger|FixupM3u8|ffmpeg)\]/i;
      const audioExtractRegex = /\[ExtractAudio\]/i;

      proc.stdout.on('data', (chunk) => {
        const text = chunk.toString();
        stdout += text;

        if (opts.onProgress) {
          const lines = text.split(/[\r\n]+/);
          for (const line of lines) {
            const pMatch = line.match(progressRegex);
            if (pMatch) {
              const percent = parseFloat(pMatch[1]);
              const total = pMatch[2];
              const speed = pMatch[3];
              const eta = pMatch[4] || null;
              opts.onProgress({
                status: 'downloading',
                percent,
                total,
                speed,
                eta,
                statusText: `Downloading: ${percent}% of ${total} at ${speed}${eta ? ` (ETA: ${eta})` : ''}`
              });
            } else if (mergerRegex.test(line)) {
              opts.onProgress({
                status: 'merging',
                percent: 96,
                statusText: 'Merging video & audio streams with FFmpeg...'
              });
            } else if (audioExtractRegex.test(line)) {
              opts.onProgress({
                status: 'extracting_audio',
                percent: 92,
                statusText: 'Transcoding & extracting audio...'
              });
            }
          }
        }
      });

      proc.stderr.on('data', (chunk) => {
        stderr += chunk.toString();
      });

      const timer = setTimeout(() => {
        if (!settled) {
          settled = true;
          try { proc.kill('SIGKILL'); } catch {}
          reject(new ProcessingTimeoutError(`yt-dlp operation exceeded ${timeoutMs}ms timeout.`));
        }
      }, timeoutMs);

      proc.on('error', (err) => {
        if (!settled) {
          settled = true;
          clearTimeout(timer);
          logger.error({ err }, 'yt-dlp spawn error');
          reject(new ProcessingFailedError(`Failed to start yt-dlp: ${err.message}`));
        }
      });

      proc.on('close', (code) => {
        if (!settled) {
          settled = true;
          clearTimeout(timer);

          if (code === 0) {
            return resolve(stdout);
          }

          const errText = (stdout + stderr).toLowerCase();

          if (
            errText.includes('sign in to confirm') ||
            errText.includes('confirm you') ||
            errText.includes('bot') ||
            errText.includes('cookies')
          ) {
            return reject(new ProcessingFailedError(
              'YouTube is blocking this server\'s IP address. The video is public but cannot be accessed from a cloud server. Please try again in a few minutes.'
            ));
          }

          if (
            errText.includes('video unavailable') ||
            errText.includes('this video has been removed') ||
            errText.includes('no video with id') ||
            errText.includes('this video is no longer available')
          ) {
            return reject(new MediaUnavailableError('This video is unavailable or has been removed.'));
          }

          if (
            errText.includes('private video') ||
            errText.includes('members-only') ||
            errText.includes('age-restricted') ||
            errText.includes('age restriction')
          ) {
            return reject(new MediaUnavailableError('This video is private, members-only, or age-restricted and cannot be downloaded.'));
          }

          if (
            errText.includes('is a live event') ||
            errText.includes('live stream') ||
            errText.includes('currently live')
          ) {
            return reject(new UnsupportedMediaError('Live stream content is not supported for downloading.'));
          }

          logger.error({ code, stderr }, 'yt-dlp exited with non-zero code');
          reject(new ProcessingFailedError(`yt-dlp failed (exit ${code}): ${stderr.slice(-500)}`));
        }
      });
    });
  }

  async getInfo(url) {
    const args = [
      '--dump-json',
      '--skip-download',
      ...this.getBaseArgs(),
      url
    ];

    const raw = await this.run(args, { timeout: 35000 });
    try {
      return JSON.parse(raw.trim());
    } catch {
      throw new ProcessingFailedError('yt-dlp returned invalid JSON metadata.');
    }
  }

  async download(url, outputPath, formatSpec, opts = {}) {
    const args = [
      ...this.getBaseArgs(),
      '-f', formatSpec,
      '--merge-output-format', 'mp4',
      '-o', outputPath
    ];

    if (opts.audioOnly) {
      const ext = opts.audioExt || 'mp3';
      args.push('--extract-audio', '--audio-format', ext, '--audio-quality', '0');
    }

    args.push(url);

    await this.run(args, {
      timeout: opts.timeout || config.MAX_PROCESSING_TIME_MS,
      onProgress: opts.onProgress
    });
  }

  spawnStream(url, formatSpec, opts = {}) {
    const args = [
      ...this.getBaseArgs(),
      '-f', formatSpec,
      '-o', '-',
      '--no-part',
      '--hls-use-mpegts',
      url
    ];

    logger.debug({ url, formatSpec }, 'Spawning yt-dlp stream to stdout');

    const proc = spawn(this.binary, args, {
      windowsHide: true,
      shell: false,
      env: { ...process.env }
    });

    return { proc, stdout: proc.stdout, stderr: proc.stderr };
  }
}

export const ytDlpService = new YtDlpService();
