import { validateMediaUrl } from '../utils/url-validator.js';
import { providerRegistry } from '../providers/provider-registry.js';
import { createJobDirectory } from '../utils/file-utils.js';
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
   * Creates an isolated ephemeral job directory and orchestrates stream fetching.
   * @param {object} options
   * @param {string} options.url
   * @param {string} options.formatId
   * @param {string} [options.container='mp4']
   * @param {string} [options.type='video']
   * @returns {Promise<{ filePath: string, filename: string, mimeType: string, jobDir: string, size?: number }>}
   */
  async download(options) {
    const { url } = options;
    const parsedUrl = validateMediaUrl(url);
    const provider = providerRegistry.resolve(parsedUrl);

    if (!provider.validate(parsedUrl)) {
      throw new InvalidUrlError(`The URL format is not a valid ${provider.name} media link.`);
    }

    // Create unique ephemeral job directory
    const { jobId, jobDir } = await createJobDirectory();

    logger.info(
      { jobId, provider: provider.name, formatId: options.formatId, container: options.container },
      'Initiating ephemeral media download job'
    );

    try {
      const result = await provider.processDownload({
        ...options,
        parsedUrl,
        jobId,
        jobDir
      });

      return {
        ...result,
        jobDir
      };
    } catch (err) {
      // Re-throw so caller/controller can perform guaranteed cleanup on jobDir
      err.jobDir = jobDir;
      throw err;
    }
  }
}

export const mediaService = new MediaService();
