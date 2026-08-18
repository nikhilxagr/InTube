import { ProviderInterface } from '../provider.interface.js';
import { PLATFORMS } from '../../utils/platform-detector.js';

export class YouTubeProvider extends ProviderInterface {
  name = PLATFORMS.YOUTUBE;

  canHandle(parsedUrl) {
    const host = parsedUrl.hostname.toLowerCase();
    return host === 'youtube.com' || host.endsWith('.youtube.com') || host === 'youtu.be' || host.endsWith('.youtu.be');
  }

  validate(parsedUrl) {
    if (!this.canHandle(parsedUrl)) return false;
    // Basic path checking: /watch, /shorts/, /v/, youtu.be/<id>
    const path = parsedUrl.pathname;
    const hasVideoParam = parsedUrl.searchParams.has('v');
    const isShorts = path.startsWith('/shorts/');
    const isShortUrl = parsedUrl.hostname.includes('youtu.be') && path.length > 1;

    return hasVideoParam || isShorts || isShortUrl || path.startsWith('/embed/');
  }

  async getMetadata(_parsedUrl) {
    // To be implemented in Phase 5
    throw new Error('YouTubeProvider: Extraction will be implemented in Phase 5.');
  }

  normalizeMetadata(raw) {
    return {
      platform: this.name,
      type: raw?.type || 'video',
      id: raw?.id || '',
      title: raw?.title || '',
      author: raw?.author || '',
      duration: raw?.duration || null,
      thumbnail: raw?.thumbnail || '',
      formats: this.getFormats(raw)
    };
  }

  getFormats(_rawMetadata) {
    return [];
  }

  async processDownload(_options) {
    throw new Error('YouTubeProvider: Download processing will be implemented in Phase 5.');
  }
}
