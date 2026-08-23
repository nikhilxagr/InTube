import path from 'path';
import { Innertube, UniversalCache } from 'youtubei.js';
import { ProviderInterface } from '../provider.interface.js';
import { PLATFORMS, detectPlatformDetails } from '../../utils/platform-detector.js';
import { sanitizeFilename, getMimeType } from '../../utils/file-utils.js';
import { ytDlpService } from '../../services/ytdlp.service.js';
import {
  AuthorizationRequiredError,
  MediaUnavailableError,
  UnsupportedMediaError
} from '../../utils/errors.js';
import { logger } from '../../utils/logger.js';

let innertubeInstance = null;
async function getInnertube() {
  if (!innertubeInstance) {
    innertubeInstance = await Innertube.create({
      cache: new UniversalCache(false),
      generate_session_locally: true
    });
  }
  return innertubeInstance;
}

export class YouTubeProvider extends ProviderInterface {
  name = PLATFORMS.YOUTUBE;

  canHandle(parsedUrl) {
    const details = detectPlatformDetails(parsedUrl);
    return details.platform === this.name;
  }

  validate(parsedUrl) {
    const details = detectPlatformDetails(parsedUrl);
    return details.platform === this.name && details.isSupported;
  }

  async getMetadata(parsedUrl) {
    const details = detectPlatformDetails(parsedUrl);
    const mediaId = details.mediaId;

    if (!mediaId) {
      throw new MediaUnavailableError('Unable to extract YouTube video ID from URL.');
    }

    const videoUrl = `https://www.youtube.com/watch?v=${mediaId}`;

    try {
      const info = await ytDlpService.getInfo(videoUrl);

      if (info.is_live || info.live_status === 'is_live' || info.live_status === 'is_upcoming') {
        throw new UnsupportedMediaError('Live stream content is not supported for downloading.');
      }

      const thumbnails = (info.thumbnails || []).sort((a, b) => (b.preference || 0) - (a.preference || 0));
      const thumbnail =
        thumbnails[0]?.url ||
        info.thumbnail ||
        `https://i.ytimg.com/vi/${mediaId}/hqdefault.jpg`;

      return {
        id: mediaId,
        url: videoUrl,
        type: details.mediaType || 'video',
        title: info.title || 'YouTube Video',
        author: info.uploader || info.channel || '',
        duration: info.duration || null,
        thumbnail,
        ytFormats: info.formats || [],
        ytInfo: info
      };
    } catch (err) {
      if (
        err instanceof AuthorizationRequiredError ||
        err instanceof MediaUnavailableError ||
        err instanceof UnsupportedMediaError
      ) {
        throw err;
      }

      logger.warn({ err: err.message, mediaId }, 'yt-dlp metadata fetch failed, attempting Innertube fallback');

      try {
        const yt = await getInnertube();
        const info = await yt.getInfo(mediaId);

        if (info.basic_info.is_live) {
          throw new UnsupportedMediaError('Live stream content is not supported for downloading.');
        }

        const rawThumbnails = info.basic_info.thumbnail || [];
        const thumbnail = rawThumbnails[rawThumbnails.length - 1]?.url || `https://i.ytimg.com/vi/${mediaId}/hqdefault.jpg`;

        const ytFormats = [
          ...(info.streaming_data?.formats || []),
          ...(info.streaming_data?.adaptive_formats || [])
        ].map((f) => ({
          format_id: String(f.itag),
          ext: f.mime_type?.includes('mp4') ? 'mp4' : (f.mime_type?.includes('webm') ? 'webm' : 'm4a'),
          width: f.width || null,
          height: f.quality_label ? parseInt(f.quality_label) : (f.height || null),
          format_note: f.quality_label || (f.has_video ? `${f.height}p` : 'audio'),
          filesize: f.content_length ? parseInt(f.content_length) : null,
          filesize_approx: f.approx_duration_ms && f.bitrate ? Math.round((f.bitrate * f.approx_duration_ms) / 8000) : null,
          vcodec: f.has_video ? (f.mime_type?.split('codecs="')[1]?.split('"')[0] || 'avc1') : 'none',
          acodec: f.has_audio ? (f.mime_type?.split('codecs="')[1]?.split('"')[0] || 'mp4a') : 'none',
          tbr: f.bitrate ? Math.round(f.bitrate / 1000) : null,
          fps: f.fps || null,
          url: f.url || null
        }));

        return {
          id: mediaId,
          url: videoUrl,
          type: details.mediaType || 'video',
          title: info.basic_info.title || 'YouTube Video',
          author: info.basic_info.author || '',
          duration: info.basic_info.duration || null,
          thumbnail,
          ytFormats,
          ytInfo: info
        };
      } catch (fallbackErr) {
        logger.error({ fallbackErr: fallbackErr.message, mediaId }, 'Both yt-dlp and Innertube failed to fetch metadata');
        throw err;
      }
    }
  }

  normalizeMetadata(raw) {
    return {
      platform: this.name,
      type: raw?.type || 'video',
      id: raw?.id || '',
      url: raw?.url || '',
      title: raw?.title || 'YouTube Video',
      author: raw?.author || '',
      duration: raw?.duration || null,
      thumbnail: raw?.thumbnail || '',
      formats: this.getFormats(raw)
    };
  }

  getFormats(rawMetadata) {
    const ytFormats = rawMetadata?.ytFormats || rawMetadata?.formats || [];
    const formatsList = [];
    const seenHeights = new Set();

    const videoFormats = ytFormats
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

    const hasAudioFormat = ytFormats.some(
      (f) => f.acodec && f.acodec !== 'none' && (!f.vcodec || f.vcodec === 'none')
    );
    if (hasAudioFormat || ytFormats.length > 0) {
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
          formatId: 'video_1080p_mp4',
          height: 1080,
          container: 'mp4',
          quality: '1080p Full HD',
          type: 'video',
          hasAudio: true,
          hasVideo: true,
          approxSize: null
        },
        {
          formatId: 'video_720p_mp4',
          height: 720,
          container: 'mp4',
          quality: '720p HD',
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
    const sanitizedTitle = sanitizeFilename(metadata.title, 'youtube_media');
    const videoUrl = `https://www.youtube.com/watch?v=${metadata.id}`;

    if (type === 'audio' || formatId.startsWith('audio_')) {
      const targetExt = container === 'm4a' ? 'm4a' : 'mp3';
      const finalPath = path.join(jobDir, `${sanitizedTitle}.${targetExt}`);

      await ytDlpService.download(videoUrl, finalPath, 'ba[ext=m4a]/ba/b', {
        audioOnly: true,
        audioExt: targetExt,
        timeout: 180000,
        onProgress: options.onProgress
      });

      return {
        filePath: finalPath,
        filename: `${sanitizedTitle}.${targetExt}`,
        mimeType: getMimeType(targetExt)
      };
    }

    const heightMatch = formatId.match(/video_(\d+)p/);
    const targetHeight = heightMatch ? parseInt(heightMatch[1], 10) : 1080;

    const finalPath = path.join(jobDir, `${sanitizedTitle}.mp4`);

    const hlsIds = { 2160: '96', 1440: '96', 1080: '96', 720: '95', 480: '94', 360: '93', 240: '92', 144: '91' };
    const allHeights = [2160, 1440, 1080, 720, 480, 360, 240, 144].filter(h => h <= targetHeight);

    for (const h of allHeights) {
      const hlsId = hlsIds[h] || '93';

      const spec = [
        hlsId,
        `bestvideo[height<=${h}][vcodec^=avc1]+bestaudio[ext=m4a]`,
        `bestvideo[height<=${h}][vcodec^=avc1]+bestaudio`,
        `bestvideo[height<=${h}]+bestaudio[ext=m4a]`,
        `bestvideo[height<=${h}]+bestaudio`,
        `best[height<=${h}]`,
      ].join('/');

      try {
        logger.info({ height: h, targetHeight, hlsId }, 'Attempting download (HLS preferred)');
        await ytDlpService.download(videoUrl, finalPath, spec, {
          timeout: 300000,
          onProgress: options.onProgress
        });
        logger.info({ height: h }, 'Download succeeded');

        return {
          filePath: finalPath,
          filename: `${sanitizedTitle}.mp4`,
          mimeType: getMimeType('mp4')
        };
      } catch (err) {
        const msg = err.message || '';
        const is403 = msg.includes('403') || msg.includes('Forbidden') || msg.includes('HTTP Error');
        const isHard = msg.includes('unavailable') || msg.includes('private') || msg.includes('removed');

        if (isHard) throw err;
        if (!is403 && !msg.includes('exit') && !msg.includes('failed')) throw err;

        logger.warn({ height: h, err: msg.slice(0, 200) }, 'Height tier blocked — trying lower quality');
      }
    }

    logger.warn({ targetHeight }, 'All height tiers failed — using unrestricted best available');
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

export const youtubeProvider = new YouTubeProvider();
