import path from 'path';
import { ProviderInterface } from '../provider.interface.js';
import { PLATFORMS, detectPlatformDetails } from '../../utils/platform-detector.js';
import { sanitizeFilename, getMimeType } from '../../utils/file-utils.js';
import { ytDlpService } from '../../services/ytdlp.service.js';
import {
  AuthorizationRequiredError,
  MediaUnavailableError,
  ProviderUnavailableError,
  UnsupportedMediaError
} from '../../utils/errors.js';
import { logger } from '../../utils/logger.js';

export class InstagramProvider extends ProviderInterface {
  name = PLATFORMS.INSTAGRAM;

  canHandle(parsedUrl) {
    const details = detectPlatformDetails(parsedUrl);
    return details.platform === this.name;
  }

  validate(parsedUrl) {
    const details = detectPlatformDetails(parsedUrl);
    return details.platform === this.name && details.isSupported;
  }

  extractMetaContent(html, property) {
    if (!html || !property) return null;
    const doubleQuoteRegex = new RegExp(`<meta[^>]*?\\s+(?:property|name)=["']${property}["'][^>]*?\\s+content="([^"]*)"`, 'i');
    const singleQuoteRegex = new RegExp(`<meta[^>]*?\\s+(?:property|name)=["']${property}["'][^>]*?\\s+content='([^']*)'`, 'i');
    const altDoubleQuote = new RegExp(`<meta[^>]*?\\s+content="([^"]*)"[^>]*?\\s+(?:property|name)=["']${property}["']`, 'i');
    const altSingleQuote = new RegExp(`<meta[^>]*?\\s+content='([^']*)'[^>]*?\\s+(?:property|name)=["']${property}["']`, 'i');
    const match = html.match(doubleQuoteRegex) || html.match(singleQuoteRegex) || html.match(altDoubleQuote) || html.match(altSingleQuote);
    return match ? match[1] : null;
  }

  async getMetadata(parsedUrl) {
    const details = detectPlatformDetails(parsedUrl);
    const mediaId = details.mediaId;

    if (!mediaId) {
      throw new MediaUnavailableError('Unable to extract Instagram media ID from URL.');
    }

    const canonicalPath = details.mediaType === 'reel' ? `/reel/${mediaId}/` : `/p/${mediaId}/`;
    const canonicalUrl = `https://www.instagram.com${canonicalPath}`;

    try {
      const res = await fetch(canonicalUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          Accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9'
        },
        redirect: 'follow'
      });

      if (res.url.includes('/accounts/login') || res.url.includes('login_required')) {
        throw new AuthorizationRequiredError(
          'This Instagram content is from a private account or requires login.'
        );
      }

      if (res.status === 404) {
        throw new MediaUnavailableError('The requested Instagram media was not found or has been removed.');
      }

      if (res.status === 401 || res.status === 403) {
        throw new AuthorizationRequiredError('This Instagram media requires authorization to view.');
      }

      const html = await res.text();
      const ogVideo = this.extractMetaContent(html, 'og:video') || this.extractMetaContent(html, 'og:video:secure_url');
      const ogImage = this.extractMetaContent(html, 'og:image') || this.extractMetaContent(html, 'og:image:secure_url');
      const ogTitle = this.extractMetaContent(html, 'og:title');
      const ogDescription = this.extractMetaContent(html, 'og:description');

      let author = '';
      let title = ogDescription || ogTitle || 'Instagram Media';

      if (ogTitle) {
        const authorMatch = ogTitle.match(/^([^(@:]+)(?:\s*\(@([^)]+)\))?\s*on\s*Instagram/i);
        if (authorMatch) {
          author = (authorMatch[2] ? `@${authorMatch[2]}` : authorMatch[1]).trim();
        }
      }

      const isVideo = Boolean(ogVideo) || details.mediaType === 'reel';

      return {
        id: mediaId,
        url: canonicalUrl,
        type: isVideo ? 'video' : 'photo',
        title: title.slice(0, 100),
        author,
        duration: null,
        thumbnail: ogImage || '',
        directMediaUrl: ogVideo || ogImage || null
      };
    } catch (err) {
      if (err instanceof AuthorizationRequiredError || err instanceof MediaUnavailableError) {
        throw err;
      }

      logger.warn({ err: err.message, mediaId }, 'Instagram OpenGraph scrape failed, trying yt-dlp fallback');
      return this.getMetadataViaYtDlp(canonicalUrl, mediaId, details);
    }
  }

  async getMetadataViaYtDlp(url, mediaId, details) {
    try {
      const info = await ytDlpService.getInfo(url);
      const isVideo = info.ext !== 'jpg' && info.ext !== 'png' && Boolean(info.vcodec || info.video_ext);

      return {
        id: mediaId,
        url,
        type: isVideo ? 'video' : 'photo',
        title: info.title || info.description?.slice(0, 80) || 'Instagram Media',
        author: info.uploader ? `@${info.uploader}` : '',
        duration: info.duration || null,
        thumbnail: info.thumbnail || '',
        ytFormats: info.formats || [],
        ytInfo: info
      };
    } catch (err) {
      const msg = (err.message || '').toLowerCase();
      if (msg.includes('login') || msg.includes('sign in') || msg.includes('private')) {
        throw new AuthorizationRequiredError('This Instagram content is private or requires login.');
      }
      if (msg.includes('unavailable') || msg.includes('not found') || msg.includes('removed')) {
        throw new MediaUnavailableError('The requested Instagram media was not found or has been removed.');
      }
      logger.error({ err: err.message, mediaId }, 'Instagram yt-dlp fallback failed');
      throw new ProviderUnavailableError('Unable to access Instagram media. Ensure the link is from a public post.');
    }
  }

  normalizeMetadata(raw) {
    return {
      platform: this.name,
      type: raw?.type || 'video',
      id: raw?.id || '',
      url: raw?.url || '',
      title: raw?.title || 'Instagram Media',
      author: raw?.author || '',
      duration: raw?.duration || null,
      thumbnail: raw?.thumbnail || '',
      formats: this.getFormats(raw)
    };
  }

  getFormats(rawMetadata) {
    const type = rawMetadata?.type || 'video';

    if (type === 'photo' || type === 'image') {
      return [
        {
          formatId: 'photo_jpg',
          container: 'jpg',
          quality: 'Original Image',
          type: 'photo',
          hasAudio: false,
          hasVideo: false,
          approxSize: null
        }
      ];
    }

    return [
      {
        formatId: 'video_hd_mp4',
        container: 'mp4',
        quality: 'Original HD',
        type: 'video',
        hasAudio: true,
        hasVideo: true,
        approxSize: null
      },
      {
        formatId: 'audio_mp3',
        container: 'mp3',
        quality: 'Audio MP3',
        type: 'audio',
        hasAudio: true,
        hasVideo: false,
        approxSize: null
      }
    ];
  }

  async processDownload(options) {
    const { parsedUrl, formatId, jobDir } = options;
    const metadata = await this.getMetadata(parsedUrl);
    const sanitizedTitle = sanitizeFilename(metadata.title, 'instagram_media');
    const videoUrl = metadata.url;

    if (metadata.type === 'photo' || metadata.type === 'image' || formatId === 'photo_jpg') {
      const finalPath = path.join(jobDir, `${sanitizedTitle}.jpg`);

      await ytDlpService.run([
        '--no-playlist', '--no-warnings',
        '-f', 'best',
        '-o', finalPath,
        videoUrl
      ], {
        timeout: 60000,
        onProgress: options.onProgress
      });

      return {
        filePath: finalPath,
        filename: `${sanitizedTitle}.jpg`,
        mimeType: getMimeType('jpg')
      };
    }

    const finalPath = path.join(jobDir, `${sanitizedTitle}.mp4`);

    await ytDlpService.run([
      '--no-playlist', '--no-warnings',
      '-f', 'bestvideo+bestaudio/best',
      '--merge-output-format', 'mp4',
      '--ffmpeg-location', ytDlpService.ffmpegBinary,
      '-o', finalPath,
      videoUrl
    ], {
      timeout: 120000,
      onProgress: options.onProgress
    });

    return {
      filePath: finalPath,
      filename: `${sanitizedTitle}.mp4`,
      mimeType: getMimeType('mp4')
    };
  }
}

export const instagramProvider = new InstagramProvider();
