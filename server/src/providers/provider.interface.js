/**
 * Base Provider Interface definition for media extractors.
 * All platform-specific extractors must inherit or conform to this interface.
 */
export class ProviderInterface {
  /**
   * Platform identifier key (e.g. 'youtube', 'instagram')
   * @type {string}
   */
  name = 'base';

  /**
   * Checks if this provider handles the specified parsed URL.
   * @param {URL} parsedUrl
   * @returns {boolean}
   */
  canHandle(_parsedUrl) {
    throw new Error('Method canHandle() must be implemented.');
  }

  /**
   * Validates if the media URL is syntactically and structurally supported by this provider.
   * @param {URL} parsedUrl
   * @returns {boolean}
   */
  validate(_parsedUrl) {
    throw new Error('Method validate() must be implemented.');
  }

  /**
   * Retrieves raw metadata from the platform source.
   * @param {URL} parsedUrl
   * @returns {Promise<object>}
   */
  async getMetadata(_parsedUrl) {
    throw new Error('Method getMetadata() must be implemented.');
  }

  /**
   * Normalizes platform-specific metadata into the standard application format.
   * @param {object} rawMetadata
   * @returns {object}
   */
  normalizeMetadata(_rawMetadata) {
    throw new Error('Method normalizeMetadata() must be implemented.');
  }

  /**
   * Extracts and normalizes available format options.
   * @param {object} rawMetadata
   * @returns {Array<object>}
   */
  getFormats(_rawMetadata) {
    throw new Error('Method getFormats() must be implemented.');
  }

  /**
   * Processes the media download stream/files into the destination directory.
   * @param {object} options
   * @param {string} options.url
   * @param {string} options.formatId
   * @param {string} options.outputDir
   * @returns {Promise<{ filePath: string, filename: string, mimeType: string }>}
   */
  async processDownload(_options) {
    throw new Error('Method processDownload() must be implemented.');
  }
}
