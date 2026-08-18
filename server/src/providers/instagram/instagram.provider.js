import { ProviderInterface } from '../provider.interface.js';
import { PLATFORMS } from '../../utils/platform-detector.js';

export class InstagramProvider extends ProviderInterface {
  name = PLATFORMS.INSTAGRAM;

  canHandle(parsedUrl) {
    const host = parsedUrl.hostname.toLowerCase();
    return host === 'instagram.com' || host.endsWith('.instagram.com') || host === 'instagr.am' || host.endsWith('.instagr.am');
  }

  validate(parsedUrl) {
    if (!this.canHandle(parsedUrl)) return false;
    const path = parsedUrl.pathname;
    // Supported path prefixes: /reel/, /reels/, /p/, /stories/, /tv/
    return (
      path.startsWith('/reel/') ||
      path.startsWith('/reels/') ||
      path.startsWith('/p/') ||
      path.startsWith('/stories/') ||
      path.startsWith('/tv/')
    );
  }

  async getMetadata(_parsedUrl) {
    // To be implemented in Phase 6
    throw new Error('InstagramProvider: Extraction will be implemented in Phase 6.');
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
    throw new Error('InstagramProvider: Download processing will be implemented in Phase 6.');
  }
}
