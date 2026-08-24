import { spawn } from 'child_process';
import path from 'path';
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
    const container = (options.container || 'mp3').toLowerCase().replace(/^\./, '');
    const bitrate = options.bitrate || '320k';
    const safeIn = this.sanitizePathArg(inputPath);
    const safeOut = this.sanitizePathArg(outputPath);

    if (container === 'mp3') {
      return [
        '-y',
        '-i', safeIn,
        '-vn',
        '-c:a', 'libmp3lame',
        '-b:a', bitrate,
        '-id3v2_version', '3',
        safeOut
      ];
    }

    if (container === 'wav') {
      return [
        '-y',
        '-i', safeIn,
        '-vn',
        '-c:a', 'pcm_s16le',
        safeOut
      ];
    }

    if (container === 'ogg') {
      return [
        '-y',
        '-i', safeIn,
        '-vn',
        '-c:a', 'libvorbis',
        '-q:a', '5',
        safeOut
      ];
    }

    // Default AAC / M4A
    return [
      '-y',
      '-i', safeIn,
      '-vn',
      '-c:a', 'aac',
      '-b:a', bitrate === '320k' ? '256k' : bitrate,
      safeOut
    ];
  }

  /**
   * Builds safe argument array for video conversion / normalization.
   * @param {string} inputPath
   * @param {string} outputPath
   * @param {object} [options={}]
   * @param {string} [options.format='mp4']
   * @param {string} [options.preset='fast']
   * @param {string} [options.crf='22']
   * @param {string} [options.quality='balanced']
   * @returns {string[]}
   */
  buildVideoConvertArgs(inputPath, outputPath, options = {}) {
    const format = (options.format || options.container || 'mp4').toLowerCase().replace(/^\./, '');
    const safeIn = this.sanitizePathArg(inputPath);
    const safeOut = this.sanitizePathArg(outputPath);

    // Preset quality mappings
    let preset = options.preset || 'fast';
    let crf = options.crf || '22';

    if (options.quality === 'high') {
      preset = 'medium';
      crf = '18';
    } else if (options.quality === 'small') {
      preset = 'faster';
      crf = '28';
    }

    if (format === 'webm') {
      return [
        '-y',
        '-i', safeIn,
        '-c:v', 'libvpx',
        '-crf', '25',
        '-b:v', '1.5M',
        '-c:a', 'libvorbis',
        '-b:a', '128k',
        safeOut
      ];
    }

    if (format === 'mov') {
      return [
        '-y',
        '-i', safeIn,
        '-c:v', 'libx264',
        '-preset', preset,
        '-crf', crf,
        '-c:a', 'aac',
        '-b:a', '128k',
        safeOut
      ];
    }

    // Default MP4 with H.264 + AAC and faststart for streaming
    return [
      '-y',
      '-i', safeIn,
      '-c:v', 'libx264',
      '-preset', preset,
      '-crf', crf,
      '-c:a', 'aac',
      '-b:a', '128k',
      '-movflags', '+faststart',
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
      '-i', safeVid,
      '-i', safeAud,
      '-c:v', 'copy',
      '-c:a', 'aac',
      '-b:a', '128k',
      '-movflags', '+faststart',
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
      '-i', safeIn,
      '-c', 'copy',
      '-movflags', '+faststart',
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
            reject(new ProcessingFailedError(`FFmpeg processing failed with exit code ${code}`));
          }
        }
      });
    });
  }

  /**
   * Probes a media file and extracts comprehensive technical metadata (resolution, duration, codecs, bitrate).
   * Uses ffprobe if available or falls back to parsing ffmpeg stderr output.
   * @param {string} inputPath
   * @returns {Promise<object>}
   */
  async probeMedia(inputPath) {
    const safeIn = this.sanitizePathArg(inputPath);

    // Strategy 1: Attempt ffprobe JSON probe
    try {
      const probeResult = await this.executeFfprobe([
        '-v', 'quiet',
        '-print_format', 'json',
        '-show_format',
        '-show_streams',
        safeIn
      ]);

      const data = JSON.parse(probeResult);
      return this.normalizeFfprobeData(data);
    } catch {
      // Strategy 2: Fallback to FFmpeg inspect banner
      logger.debug({ inputPath }, 'ffprobe unavailable or failed, attempting ffmpeg inspect fallback');
      return await this.probeViaFfmpeg(safeIn);
    }
  }

  /**
   * Executes ffprobe binary safely.
   * @param {string[]} args
   * @returns {Promise<string>}
   */
  executeFfprobe(args) {
    return new Promise((resolve, reject) => {
      const proc = spawn(this.ffprobeBinary, args, {
        windowsHide: true,
        shell: false
      });

      let stdout = '';
      let stderr = '';

      proc.stdout.on('data', (c) => { stdout += c.toString(); });
      proc.stderr.on('data', (c) => { stderr += c.toString(); });

      const timer = setTimeout(() => {
        try {
          proc.kill('SIGKILL');
        } catch {
          // Process might have already exited
        }
        reject(new Error('ffprobe timed out'));
      }, 10000);

      proc.on('error', (err) => {
        clearTimeout(timer);
        reject(err);
      });

      proc.on('close', (code) => {
        clearTimeout(timer);
        if (code === 0 && stdout.trim()) {
          resolve(stdout);
        } else {
          reject(new Error(stderr || `ffprobe exited with code ${code}`));
        }
      });
    });
  }

  /**
   * Fallback metadata inspection by parsing FFmpeg stderr banner.
   * @param {string} safeIn
   * @returns {Promise<object>}
   */
  probeViaFfmpeg(safeIn) {
    return new Promise((resolve, reject) => {
      const proc = spawn(this.ffmpegBinary, ['-hide_banner', '-i', safeIn], {
        windowsHide: true,
        shell: false
      });

      let output = '';
      proc.stderr.on('data', (c) => { output += c.toString(); });
      proc.stdout.on('data', (c) => { output += c.toString(); });

      const timer = setTimeout(() => {
        try {
          proc.kill('SIGKILL');
        } catch {
          // Process might have already exited
        }
        reject(new Error('ffmpeg probe timed out'));
      }, 10000);

      proc.on('close', () => {
        clearTimeout(timer);
        try {
          const parsed = this.parseFfmpegBanner(output);
          resolve(parsed);
        } catch (err) {
          reject(new ProcessingFailedError(`Unable to inspect media file: ${err.message}`));
        }
      });
    });
  }

  /**
   * Normalizes ffprobe JSON data into a clean, sanitized object.
   * @param {object} raw
   * @returns {object}
   */
  normalizeFfprobeData(raw) {
    const format = raw.format || {};
    const streams = raw.streams || [];

    const videoStream = streams.find((s) => s.codec_type === 'video');
    const audioStream = streams.find((s) => s.codec_type === 'audio');

    const durationSec = parseFloat(format.duration || videoStream?.duration || audioStream?.duration || 0);
    const sizeBytes = parseInt(format.size || 0, 10);
    const bitrateKbps = format.bit_rate ? Math.round(parseInt(format.bit_rate, 10) / 1000) : null;

    let video = null;
    if (videoStream) {
      const fpsRaw = videoStream.r_frame_rate || videoStream.avg_frame_rate || '0/1';
      let fps = null;
      if (fpsRaw.includes('/')) {
        const [num, den] = fpsRaw.split('/').map(Number);
        if (den && den > 0) fps = Math.round(num / den);
      } else {
        fps = Math.round(parseFloat(fpsRaw)) || null;
      }

      video = {
        codec: videoStream.codec_name || 'unknown',
        width: videoStream.width || 0,
        height: videoStream.height || 0,
        resolution: videoStream.width && videoStream.height ? `${videoStream.width}x${videoStream.height}` : null,
        fps,
        aspectRatio: videoStream.display_aspect_ratio || null
      };
    }

    let audio = null;
    if (audioStream) {
      audio = {
        codec: audioStream.codec_name || 'unknown',
        sampleRate: audioStream.sample_rate ? `${audioStream.sample_rate} Hz` : null,
        channels: audioStream.channels || 2,
        bitrate: audioStream.bit_rate ? `${Math.round(parseInt(audioStream.bit_rate, 10) / 1000)} kbps` : null
      };
    }

    const mins = Math.floor(durationSec / 60);
    const secs = Math.floor(durationSec % 60);
    const durationFormatted = durationSec > 0 ? `${mins}:${secs.toString().padStart(2, '0')}` : null;

    return {
      format: (format.format_name || '').split(',')[0] || 'media',
      duration: durationSec,
      durationFormatted,
      sizeBytes,
      sizeFormatted: sizeBytes > 0 ? `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB` : null,
      bitrateKbps,
      video,
      audio,
      streamsCount: streams.length
    };
  }

  /**
   * Parses FFmpeg CLI stderr string into structured metadata when ffprobe is missing.
   * @param {string} text
   * @returns {object}
   */
  parseFfmpegBanner(text) {
    // Duration: 00:03:21.45, start: 0.000000, bitrate: 1024 kb/s
    const durMatch = text.match(/Duration:\s*(\d+):(\d+):([\d.]+)/);
    let durationSec = 0;
    let durationFormatted = null;

    if (durMatch) {
      const h = parseInt(durMatch[1], 10);
      const m = parseInt(durMatch[2], 10);
      const s = parseFloat(durMatch[3]);
      durationSec = Math.round(h * 3600 + m * 60 + s);
      const totalM = Math.floor(durationSec / 60);
      const remS = Math.floor(durationSec % 60);
      durationFormatted = `${totalM}:${remS.toString().padStart(2, '0')}`;
    }

    const bitMatch = text.match(/bitrate:\s*(\d+)\s*kb\/s/);
    const bitrateKbps = bitMatch ? parseInt(bitMatch[1], 10) : null;

    // Stream #0:0: Video: h264 (...), yuv420p(...), 1920x1080 [SAR 1:1 DAR 16:9], 30 fps
    const vidMatch = text.match(/Stream\s+#\d+:\d+.*Video:\s*([a-zA-Z0-9_-]+).*?,\s*(\d{2,5})x(\d{2,5})/);
    const fpsMatch = text.match(/(\d+(?:\.\d+)?)\s*fps/);

    let video = null;
    if (vidMatch) {
      video = {
        codec: vidMatch[1],
        width: parseInt(vidMatch[2], 10),
        height: parseInt(vidMatch[3], 10),
        resolution: `${vidMatch[2]}x${vidMatch[3]}`,
        fps: fpsMatch ? Math.round(parseFloat(fpsMatch[1])) : null,
        aspectRatio: null
      };
    }

    // Stream #0:1: Audio: aac (...), 44100 Hz, stereo, fltp, 128 kb/s
    const audMatch = text.match(/Stream\s+#\d+:\d+.*Audio:\s*([a-zA-Z0-9_-]+).*?,\s*(\d+)\s*Hz(?:,\s*([a-zA-Z0-9]+))?(?:,\s*.*?,\s*(\d+)\s*kb\/s)?/);
    let audio = null;
    if (audMatch) {
      audio = {
        codec: audMatch[1],
        sampleRate: audMatch[2] ? `${audMatch[2]} Hz` : null,
        channels: audMatch[3] === 'mono' ? 1 : 2,
        bitrate: audMatch[4] ? `${audMatch[4]} kbps` : null
      };
    }

    return {
      format: video ? 'video' : (audio ? 'audio' : 'media'),
      duration: durationSec,
      durationFormatted,
      sizeBytes: 0,
      sizeFormatted: null,
      bitrateKbps,
      video,
      audio,
      streamsCount: (video ? 1 : 0) + (audio ? 1 : 0)
    };
  }

  /**
   * Extracts audio stream to MP3, M4A, WAV, or OGG container.
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
   * Transcodes video stream to optimized MP4, WebM, or MOV format.
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

  /**
   * Converts an audio file between formats (MP3, M4A, WAV, AAC, OGG).
   * @param {string} inputPath
   * @param {string} outputPath
   * @param {object} [options={}]
   * @returns {Promise<void>}
   */
  async convertAudio(inputPath, outputPath, options = {}) {
    const format = (options.container || path.extname(outputPath).slice(1) || 'mp3').toLowerCase();
    const bitrate = options.bitrate || '192k';

    const args = ['-y', '-hide_banner', '-i', inputPath, '-vn'];

    if (format === 'wav') {
      args.push('-c:a', 'pcm_s16le');
    } else if (format === 'm4a' || format === 'aac') {
      args.push('-c:a', 'aac', '-b:a', bitrate);
    } else if (format === 'ogg') {
      args.push('-c:a', 'libvorbis', '-b:a', bitrate);
    } else {
      // Default MP3
      args.push('-c:a', 'libmp3lame', '-b:a', bitrate);
    }

    args.push(outputPath);
    await this.execute(args, options);
  }

  /**
   * Extracts single frame or frame interval sequence from video.
   * @param {string} inputPath
   * @param {string} outputTarget - File path or output directory pattern
   * @param {object} [options={}]
   * @returns {Promise<void>}
   */
  async extractFrames(inputPath, outputTarget, options = {}) {
    const { mode = 'first_frame', timestamp = '00:00:00.100', interval = 5, maxFrames = 30 } = options;

    if (mode === 'first_frame') {
      const args = [
        '-y', '-hide_banner',
        '-ss', '00:00:00.100',
        '-i', inputPath,
        '-vframes', '1',
        '-q:v', '2',
        outputTarget
      ];
      await this.execute(args, options);
    } else if (mode === 'timestamp') {
      const args = [
        '-y', '-hide_banner',
        '-ss', String(timestamp),
        '-i', inputPath,
        '-vframes', '1',
        '-q:v', '2',
        outputTarget
      ];
      await this.execute(args, options);
    } else if (mode === 'interval') {
      const safeInterval = Math.max(1, parseInt(interval, 10) || 5);
      const safeMaxFrames = Math.max(1, Math.min(30, parseInt(maxFrames, 10) || 30));

      const args = [
        '-y', '-hide_banner',
        '-i', inputPath,
        '-vf', `fps=1/${safeInterval}`,
        '-vframes', String(safeMaxFrames),
        '-q:v', '2',
        outputTarget
      ];
      await this.execute(args, options);
    }
  }
}

export const ffmpegService = new FFmpegService();
