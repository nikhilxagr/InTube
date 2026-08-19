import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { detectPlatform, detectPlatformDetails, PLATFORMS, MEDIA_TYPES } from '../src/utils/platform-detector.js';

describe('Platform Detector & Subtype Identifier', () => {
  describe('YouTube Platform Matchers', () => {
    test('detects standard YouTube watch video URLs', () => {
      const url = new URL('https://www.youtube.com/watch?v=dQw4w9WgXcQ&feature=share');
      const details = detectPlatformDetails(url);

      assert.equal(details.platform, PLATFORMS.YOUTUBE);
      assert.equal(details.mediaType, MEDIA_TYPES.VIDEO);
      assert.equal(details.mediaId, 'dQw4w9WgXcQ');
      assert.equal(details.isSupported, true);
      assert.equal(detectPlatform(url), PLATFORMS.YOUTUBE);
    });

    test('detects youtu.be shortlinks', () => {
      const url = new URL('https://youtu.be/dQw4w9WgXcQ?t=42');
      const details = detectPlatformDetails(url);

      assert.equal(details.platform, PLATFORMS.YOUTUBE);
      assert.equal(details.mediaType, MEDIA_TYPES.VIDEO);
      assert.equal(details.mediaId, 'dQw4w9WgXcQ');
      assert.equal(details.isSupported, true);
    });

    test('detects YouTube Shorts URLs', () => {
      const url = new URL('https://www.youtube.com/shorts/3i_JmJ7eH5c');
      const details = detectPlatformDetails(url);

      assert.equal(details.platform, PLATFORMS.YOUTUBE);
      assert.equal(details.mediaType, MEDIA_TYPES.SHORTS);
      assert.equal(details.mediaId, '3i_JmJ7eH5c');
      assert.equal(details.isSupported, true);
    });

    test('detects mobile YouTube and embed URLs', () => {
      const mobileUrl = new URL('https://m.youtube.com/watch?v=dQw4w9WgXcQ');
      const embedUrl = new URL('https://www.youtube.com/embed/dQw4w9WgXcQ');

      assert.equal(detectPlatformDetails(mobileUrl).platform, PLATFORMS.YOUTUBE);
      assert.equal(detectPlatformDetails(embedUrl).platform, PLATFORMS.YOUTUBE);
    });
  });

  describe('Instagram Platform Matchers', () => {
    test('detects Instagram Reels URLs', () => {
      const url = new URL('https://www.instagram.com/reel/C3abc123xyz/?utm_source=ig_web_copy_link');
      const details = detectPlatformDetails(url);

      assert.equal(details.platform, PLATFORMS.INSTAGRAM);
      assert.equal(details.mediaType, MEDIA_TYPES.REEL);
      assert.equal(details.mediaId, 'C3abc123xyz');
      assert.equal(details.isSupported, true);
      assert.equal(detectPlatform(url), PLATFORMS.INSTAGRAM);
    });

    test('detects Instagram Post / Photo URLs', () => {
      const url = new URL('https://instagram.com/p/C99xyz123/');
      const details = detectPlatformDetails(url);

      assert.equal(details.platform, PLATFORMS.INSTAGRAM);
      assert.equal(details.mediaType, MEDIA_TYPES.POST);
      assert.equal(details.mediaId, 'C99xyz123');
      assert.equal(details.isSupported, true);
    });

    test('detects Instagram Story URLs', () => {
      const url = new URL('https://www.instagram.com/stories/photographer/3123456789012345678/');
      const details = detectPlatformDetails(url);

      assert.equal(details.platform, PLATFORMS.INSTAGRAM);
      assert.equal(details.mediaType, MEDIA_TYPES.STORY);
      assert.equal(details.mediaId, '3123456789012345678');
      assert.equal(details.isSupported, true);
    });
  });

  describe('Unsupported Platforms & Domains', () => {
    const unsupported = [
      'https://www.tiktok.com/@user/video/7123456789',
      'https://twitter.com/user/status/123456789',
      'https://x.com/user/status/123456789',
      'https://vimeo.com/12345678',
      'https://www.facebook.com/watch/?v=123456',
      'https://open.spotify.com/track/abc',
      'https://soundcloud.com/artist/song',
      'https://evil.com/video.mp4',
      'https://example.org/download'
    ];

    for (const urlStr of unsupported) {
      test(`flags ${urlStr} as unsupported and unknown`, () => {
        const url = new URL(urlStr);
        const details = detectPlatformDetails(url);

        assert.equal(details.platform, PLATFORMS.UNKNOWN);
        assert.equal(details.isSupported, false);
        assert.equal(detectPlatform(url), PLATFORMS.UNKNOWN);
      });
    }
  });
});
