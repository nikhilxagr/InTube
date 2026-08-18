import { YouTubeProvider } from './youtube/youtube.provider.js';
import { InstagramProvider } from './instagram/instagram.provider.js';
import { UnsupportedPlatformError } from '../utils/errors.js';

class ProviderRegistry {
  constructor() {
    /** @type {Map<string, import('./provider.interface.js').ProviderInterface>} */
    this.providers = new Map();

    // Register built-in providers
    this.register(new YouTubeProvider());
    this.register(new InstagramProvider());
  }

  /**
   * Registers a provider instance
   * @param {import('./provider.interface.js').ProviderInterface} provider
   */
  register(provider) {
    this.providers.set(provider.name, provider);
  }

  /**
   * Resolves the appropriate provider for a given parsed URL
   * @param {URL} parsedUrl
   * @returns {import('./provider.interface.js').ProviderInterface}
   */
  resolve(parsedUrl) {
    for (const provider of this.providers.values()) {
      if (provider.canHandle(parsedUrl)) {
        return provider;
      }
    }
    throw new UnsupportedPlatformError(`No provider found capable of handling host "${parsedUrl.hostname}".`);
  }

  /**
   * Retrieves all registered provider names
   * @returns {string[]}
   */
  getRegisteredNames() {
    return Array.from(this.providers.keys());
  }
}

export const providerRegistry = new ProviderRegistry();
