import { YouTubeProvider } from './youtube/youtube.provider.js';
import { InstagramProvider } from './instagram/instagram.provider.js';
import { FacebookProvider } from './facebook/facebook.provider.js';
import { UnsupportedPlatformError } from '../utils/errors.js';

export class ProviderRegistry {
  constructor() {
    /** @type {Map<string, import('./provider.interface.js').ProviderInterface>} */
    this.providers = new Map();

    // Register built-in providers
    this.register(new YouTubeProvider());
    this.register(new InstagramProvider());
    this.register(new FacebookProvider());
  }

  /**
   * Registers a provider instance.
   * @param {import('./provider.interface.js').ProviderInterface} provider
   */
  register(provider) {
    if (!provider || !provider.name) {
      throw new Error('Provider must have a valid name property.');
    }
    this.providers.set(provider.name, provider);
  }

  /**
   * Checks if a provider key exists.
   * @param {string} name
   * @returns {boolean}
   */
  has(name) {
    return this.providers.has(name);
  }

  /**
   * Retrieves a provider by name.
   * @param {string} name
   * @returns {import('./provider.interface.js').ProviderInterface | undefined}
   */
  get(name) {
    return this.providers.get(name);
  }

  /**
   * Resolves the matching provider for a parsed URL object.
   * @param {URL} parsedUrl
   * @returns {import('./provider.interface.js').ProviderInterface}
   */
  resolve(parsedUrl) {
    for (const provider of this.providers.values()) {
      if (provider.canHandle(parsedUrl)) {
        return provider;
      }
    }
    throw new UnsupportedPlatformError(`No provider is available for domain "${parsedUrl.hostname}". Supported platforms: YouTube, Instagram, Facebook.`);
  }

  /**
   * Checks if any registered provider can handle the given URL.
   * @param {URL} parsedUrl
   * @returns {boolean}
   */
  canHandle(parsedUrl) {
    for (const provider of this.providers.values()) {
      if (provider.canHandle(parsedUrl)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Retrieves all registered provider names.
   * @returns {string[]}
   */
  getRegisteredNames() {
    return Array.from(this.providers.keys());
  }
}

export const providerRegistry = new ProviderRegistry();
