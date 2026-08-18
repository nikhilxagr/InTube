import { validateMediaUrl } from '../utils/url-validator.js';
import { providerRegistry } from '../providers/provider-registry.js';
import { InvalidUrlError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

export class MediaService {
  /**
   * Validates a URL and retrieves normalized media metadata via the appropriate provider.
   * @param {string} rawUrl
   * @returns {Promise<object>}
   */
  async analyze(rawUrl) {
    const parsedUrl = validateMediaUrl(rawUrl);
    const provider = providerRegistry.resolve(parsedUrl);

    if (!provider.validate(parsedUrl)) {
      throw new InvalidUrlError(`The URL format is not a valid ${provider.name} media link.`);
    }

    logger.info({ provider: provider.name, host: parsedUrl.hostname }, 'Analyzing media URL');
    const rawMetadata = await provider.getMetadata(parsedUrl);
    return provider.normalizeMetadata(rawMetadata);
  }

  /**
   * Coordinates media download and processing via the designated provider and FFmpeg.
   * @param {object} options
   * @param {string} options.url
   * @param {string} options.formatId
   * @param {string} options.container
   * @param {string} options.type
   * @returns {Promise<object>}
   */
  async download(options) {
    const { url } = options;
    const parsedUrl = validateMediaUrl(url);
    const provider = providerRegistry.resolve(parsedUrl);

    if (!provider.validate(parsedUrl)) {
      throw new InvalidUrlError(`The URL format is not a valid ${provider.name} media link.`);
    }

    logger.info({ provider: provider.name, formatId: options.formatId }, 'Initiating media processing');
    return provider.processDownload(options);
  }
}

export const mediaService = new MediaService();
