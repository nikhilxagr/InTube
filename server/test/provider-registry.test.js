import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { providerRegistry, ProviderRegistry } from '../src/providers/provider-registry.js';
import { YouTubeProvider } from '../src/providers/youtube/youtube.provider.js';
import { InstagramProvider } from '../src/providers/instagram/instagram.provider.js';
import { ProviderInterface } from '../src/providers/provider.interface.js';
import { UnsupportedPlatformError } from '../src/utils/errors.js';

describe('Provider Registry & Provider Interface Architecture', () => {
  test('default providerRegistry contains built-in providers', () => {
    const names = providerRegistry.getRegisteredNames();
    assert.ok(names.includes('youtube'));
    assert.ok(names.includes('instagram'));
    assert.equal(providerRegistry.has('youtube'), true);
    assert.equal(providerRegistry.has('instagram'), true);
  });

  test('resolves YouTubeProvider for YouTube URLs', () => {
    const ytUrl = new URL('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    const provider = providerRegistry.resolve(ytUrl);

    assert.ok(provider instanceof YouTubeProvider);
    assert.equal(provider.name, 'youtube');
    assert.equal(provider.validate(ytUrl), true);
  });

  test('resolves InstagramProvider for Instagram URLs', () => {
    const igUrl = new URL('https://www.instagram.com/reel/C3abc123/');
    const provider = providerRegistry.resolve(igUrl);

    assert.ok(provider instanceof InstagramProvider);
    assert.equal(provider.name, 'instagram');
    assert.equal(provider.validate(igUrl), true);
  });

  test('throws UnsupportedPlatformError when resolving unsupported domains', () => {
    const unsupportedUrls = [
      new URL('https://vimeo.com/12345'),
      new URL('https://tiktok.com/@user/video/123'),
      new URL('https://unknown-domain.com/video.mp4')
    ];

    for (const url of unsupportedUrls) {
      assert.equal(providerRegistry.canHandle(url), false);
      assert.throws(
        () => providerRegistry.resolve(url),
        (err) => {
          assert.ok(err instanceof UnsupportedPlatformError);
          assert.equal(err.code, 'UNSUPPORTED_PLATFORM');
          assert.equal(err.statusCode, 400);
          return true;
        }
      );
    }
  });

  test('allows registering and resolving custom extensible providers', () => {
    class CustomProvider extends ProviderInterface {
      name = 'custom-platform';
      canHandle(url) {
        return url.hostname.includes('custom-platform.com');
      }
      validate(url) {
        return this.canHandle(url);
      }
    }

    const registry = new ProviderRegistry();
    const custom = new CustomProvider();
    registry.register(custom);

    assert.equal(registry.has('custom-platform'), true);
    const resolved = registry.resolve(new URL('https://custom-platform.com/clip/123'));
    assert.equal(resolved.name, 'custom-platform');
  });
});
