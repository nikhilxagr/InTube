/**
 * Standard Provider Interface Contract for all platform media extractors.
 * Any new platform provider (e.g. YouTube, Instagram, etc.) must inherit and implement this class.
 */
export class ProviderInterface {
  /**
   * Platform identifier key (e.g. 'youtube', 'instagram')
   * @type {string}
   */
  name = 'base';

  /**
   * Checks whether this provider can handle the given parsed URL.
   * @param {URL} parsedUrl
   * @returns {boolean}
   */
  canHandle(_parsedUrl) {
    throw new Error(`Provider [${this.name}]: canHandle() must be implemented.`);
  }

  /**
   * Validates if the media URL is structurally and syntactically valid for this provider.
   * @param {URL} parsedUrl
   * @returns {boolean}
   */
  validate(_parsedUrl) {
    throw new Error(`Provider [${this.name}]: validate() must be implemented.`);
  }

  /**
   * Retrieves raw metadata from the platform.
   * @param {URL} parsedUrl
   * @returns {Promise<object>}
   */
  async getMetadata(_parsedUrl) {
    throw new Error(`Provider [${this.name}]: getMetadata() must be implemented.`);
  }

  /**
   * Normalizes raw platform metadata into the standard application payload shape.
   * @param {object} rawMetadata
   * @returns {object} Standardized metadata object
   */
  normalizeMetadata(_rawMetadata) {
    throw new Error(`Provider [${this.name}]: normalizeMetadata() must be implemented.`);
  }

  /**
   * Extracts and normalizes available format options.
   * @param {object} rawMetadata
   * @returns {Array<object>} List of format objects
   */
  getFormats(_rawMetadata) {
    throw new Error(`Provider [${this.name}]: getFormats() must be implemented.`);
  }

  /**
   * Processes the download stream into an ephemeral job directory.
   * @param {object} options
   * @param {string} options.url
   * @param {string} options.formatId
   * @param {string} options.outputDir
   * @returns {Promise<{ filePath: string, filename: string, mimeType: string }>}
   */
  async processDownload(_options) {
    throw new Error(`Provider [${this.name}]: processDownload() must be implemented.`);
  }
}
