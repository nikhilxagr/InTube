import fsPromises from 'fs/promises';
import path from 'path';
import { ProviderInterface } from '../provider.interface.js';
import { PLATFORMS, detectPlatformDetails } from '../../utils/platform-detector.js';
import { sanitizeFilename, getMimeType } from '../../utils/file-utils.js';
import { ytDlpService } from '../../services/ytdlp.service.js';
import { ffmpegService } from '../../services/ffmpeg.service.js';
import {
  AuthorizationRequiredError,
  MediaUnavailableError,
  ProviderUnavailableError,
  UnsupportedMediaError
} from '../../utils/errors.js';
import { logger } from '../../utils/logger.js';

export class FacebookProvider extends ProviderInterface {
  name = PLATFORMS.FACEBOOK;

  canHandle(parsedUrl) {
    const details = detectPlatformDetails(parsedUrl);
    return details.platform === this.name;
  }

  validate(parsedUrl) {
    const details = detectPlatformDetails(parsedUrl);
    return details.platform === this.name && details.isSupported;
  }

  async getMetadata(parsedUrl) {
    const videoUrl = parsedUrl.href;

    try {
      const info = await ytDlpService.getInfo(videoUrl);

      const thumbnails = (info.thumbnails || []).sort(
        (a, b) => (b.preference || 0) - (a.preference || 0)
      );
      const rawThumb = thumbnails[0]?.url || info.thumbnail || '';
      const thumbnail = rawThumb ? rawThumb.replace(/&amp;/g, '&') : '';

      return {
        id: info.id || String(Date.now()),
        url: videoUrl,
        type: 'video',
        title: info.description?.trim() || info.title?.trim() || 'Facebook Video',
        author: info.uploader || info.channel || info.uploader_id || '',
        duration: info.duration || null,
        thumbnail,
        fbFormats: info.formats || [],
        fbInfo: info
      };
    } catch (err) {
      const msg = (err.message || '').toLowerCase();

      if (
        msg.includes('login') ||
        msg.includes('sign in') ||
        msg.includes('private') ||
        msg.includes('age-restricted') ||
        msg.includes('authorization')
      ) {
        throw new AuthorizationRequiredError(
          'This Facebook video is private or requires login to access.'
        );
      }

      if (
        msg.includes('unavailable') ||
        msg.includes('not found') ||
        msg.includes('removed') ||
        msg.includes('404')
      ) {
        throw new MediaUnavailableError(
          'This Facebook video is unavailable or has been removed.'
        );
      }

      if (msg.includes('live') || msg.includes('is_live')) {
        throw new UnsupportedMediaError('Live Facebook streams cannot be downloaded.');
      }

      logger.error({ err: err.message, url: videoUrl }, 'Facebook yt-dlp metadata fetch failed');
      throw new ProviderUnavailableError(
        'Unable to access this Facebook video. Ensure it is a public post or video.'
      );
    }
  }

  normalizeMetadata(raw) {
    return {
      platform: this.name,
      type: raw?.type || 'video',
      id: raw?.id || '',
      url: raw?.url || '',
      title: raw?.title || 'Facebook Video',
      author: raw?.author || '',
      duration: raw?.duration || null,
      thumbnail: raw?.thumbnail || '',
      formats: this.getFormats(raw)
    };
  }

  getFormats(rawMetadata) {
    const fbFormats = rawMetadata?.fbFormats || rawMetadata?.formats || [];
    const formatsList = [];
    const seenHeights = new Set();

    const videoFormats = fbFormats
      .filter((f) => f.vcodec && f.vcodec !== 'none' && f.height && f.height >= 144)
      .sort((a, b) => (b.height || 0) - (a.height || 0));

    for (const f of videoFormats) {
      const height = f.height;
      if (seenHeights.has(height)) continue;
      seenHeights.add(height);

      let label = `${height}p`;
      if (height >= 2160) label = `${height}p 4K UHD`;
      else if (height >= 1440) label = `${height}p 2K QHD`;
      else if (height >= 1080) label = `${height}p Full HD`;
      else if (height >= 720) label = `${height}p HD`;
      else if (height >= 480) label = `${height}p SD`;

      let approxSize = null;
      if (f.filesize) approxSize = f.filesize;
      else if (f.filesize_approx) approxSize = f.filesize_approx;
      else if (f.tbr && rawMetadata?.duration) {
        approxSize = Math.round(((f.tbr * 1000) / 8) * rawMetadata.duration);
      }

      formatsList.push({
        formatId: `video_${height}p_mp4`,
        height,
        container: 'mp4',
        quality: label,
        type: 'video',
        hasAudio: true,
        hasVideo: true,
        approxSize
      });
    }

    const hasAudioFormat = fbFormats.some(
      (f) => f.acodec && f.acodec !== 'none' && (!f.vcodec || f.vcodec === 'none')
    );
    if (hasAudioFormat || fbFormats.length > 0) {
      formatsList.push(
        {
          formatId: 'audio_mp3',
          container: 'mp3',
          quality: 'Audio MP3 (320kbps)',
          type: 'audio',
          hasAudio: true,
          hasVideo: false,
          approxSize: null
        },
        {
          formatId: 'audio_m4a',
          container: 'm4a',
          quality: 'Audio M4A (128kbps)',
          type: 'audio',
          hasAudio: true,
          hasVideo: false,
          approxSize: null
        }
      );
    }

    if (formatsList.length === 0) {
      return [
        {
          formatId: 'video_hd_mp4',
          container: 'mp4',
          quality: 'Best Available HD',
          type: 'video',
          hasAudio: true,
          hasVideo: true,
          approxSize: null
        },
        {
          formatId: 'audio_mp3',
          container: 'mp3',
          quality: 'Audio MP3 (320kbps)',
          type: 'audio',
          hasAudio: true,
          hasVideo: false,
          approxSize: null
        }
      ];
    }

    return formatsList;
  }

  async processDownload(options) {
    const { parsedUrl, formatId, container = 'mp4', type = 'video', jobDir } = options;

    const metadata = await this.getMetadata(parsedUrl);
    const sanitizedTitle = sanitizeFilename(metadata.title, 'facebook_video');
    const videoUrl = metadata.url;

    if (type === 'audio' || formatId.startsWith('audio_') || container === 'mp3' || container === 'm4a') {
      const targetExt = container === 'm4a' ? 'm4a' : 'mp3';
      const finalPath = path.join(jobDir, `${sanitizedTitle}.${targetExt}`);
      const tempVideoPath = path.join(jobDir, `temp_fb_${Date.now()}.mp4`);

      try {
        await ytDlpService.download(videoUrl, finalPath, 'ba[ext=m4a]/ba/best', {
          audioOnly: true,
          audioExt: targetExt,
          timeout: 180000,
          onProgress: options.onProgress
        });
        await fsPromises.access(finalPath);
      } catch (err) {
        logger.warn({ err: err.message }, 'Facebook direct audio download failed, downloading video + extracting audio with FFmpeg');
        await ytDlpService.download(videoUrl, tempVideoPath, 'best', {
          timeout: 180000,
          onProgress: options.onProgress
        });

        await ffmpegService.extractAudio(tempVideoPath, finalPath, {
          container: targetExt,
          bitrate: '320k'
        });

        await fsPromises.unlink(tempVideoPath).catch(() => {});
      }

      return {
        filePath: finalPath,
        filename: `${sanitizedTitle}.${targetExt}`,
        mimeType: getMimeType(targetExt)
      };
    }

    const heightMatch = formatId.match(/video_(\d+)p/);
    const targetHeight = heightMatch ? parseInt(heightMatch[1], 10) : 1080;

    const finalPath = path.join(jobDir, `${sanitizedTitle}.mp4`);

    const allHeights = [2160, 1080, 720, 480, 360, 240, 144].filter(h => h <= targetHeight);

    for (const h of allHeights) {
      const spec = [
        `bestvideo[height<=${h}][vcodec^=avc1]+bestaudio[ext=m4a]`,
        `bestvideo[height<=${h}][vcodec^=avc1]+bestaudio`,
        `bestvideo[height<=${h}]+bestaudio[ext=m4a]`,
        `bestvideo[height<=${h}]+bestaudio`,
        `best[height<=${h}]`
      ].join('/');

      try {
        logger.info({ height: h, targetHeight }, 'Facebook download attempt');
        await ytDlpService.download(videoUrl, finalPath, spec, {
          timeout: 300000,
          onProgress: options.onProgress
        });
        logger.info({ height: h }, 'Facebook download succeeded');

        return {
          filePath: finalPath,
          filename: `${sanitizedTitle}.mp4`,
          mimeType: getMimeType('mp4')
        };
      } catch (err) {
        const msg = err.message || '';
        const is403 = msg.includes('403') || msg.includes('Forbidden') || msg.includes('HTTP Error');
        const isHard =
          msg.includes('unavailable') || msg.includes('private') || msg.includes('removed') || msg.includes('login');

        if (isHard) throw new MediaUnavailableError('This Facebook video is unavailable or private.');
        if (!is403 && !msg.includes('exit') && !msg.includes('failed')) throw err;

        logger.warn({ height: h, err: msg.slice(0, 200) }, 'Facebook height tier failed, trying lower');
      }
    }

    logger.warn({ targetHeight }, 'All Facebook height tiers failed, using best available');
    await ytDlpService.download(videoUrl, finalPath, 'best/worst', {
      timeout: 300000,
      onProgress: options.onProgress
    });

    return {
      filePath: finalPath,
      filename: `${sanitizedTitle}.mp4`,
      mimeType: getMimeType('mp4')
    };
  }
}

export const facebookProvider = new FacebookProvider();
