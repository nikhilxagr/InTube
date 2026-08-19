import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { InstagramProvider } from '../src/providers/instagram/instagram.provider.js';
import { createApp } from '../src/app.js';

describe('Instagram Provider — Compliant Public Metadata Extraction', () => {
  const provider = new InstagramProvider();

  test('canHandle and validate correct Instagram URL structures', () => {
    const valid = [
      new URL('https://www.instagram.com/reel/C3abc123xyz/'),
      new URL('https://instagram.com/p/C99xyz123/'),
      new URL('https://www.instagram.com/reels/C3abc123/'),
      new URL('https://instagr.am/reel/abc123xyz')
    ];

    for (const url of valid) {
      assert.equal(provider.canHandle(url), true);
      assert.equal(provider.validate(url), true);
    }
  });

  test('validate rejects URLs missing media identifiers', () => {
    const invalid = [
      new URL('https://www.instagram.com/'),
      new URL('https://www.instagram.com/explore/'),
      new URL('https://www.instagram.com/direct/inbox/')
    ];

    for (const url of invalid) {
      assert.equal(provider.validate(url), false);
    }
  });

  test('extractMetaContent parses OpenGraph tags from HTML', () => {
    const sampleHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta property="og:title" content="Photographer (@nature) on Instagram: 'Sunset in the mountains'" />
          <meta property="og:image" content="https://instagram.fdel.net/v/t51/sample_thumb.jpg" />
          <meta property="og:video" content="https://instagram.fdel.net/v/t50/sample_reel.mp4" />
          <meta property="og:type" content="video.other" />
        </head>
        <body></body>
      </html>
    `;

    assert.equal(
      provider.extractMetaContent(sampleHtml, 'og:title'),
      "Photographer (@nature) on Instagram: 'Sunset in the mountains'"
    );
    assert.equal(
      provider.extractMetaContent(sampleHtml, 'og:image'),
      'https://instagram.fdel.net/v/t51/sample_thumb.jpg'
    );
    assert.equal(
      provider.extractMetaContent(sampleHtml, 'og:video'),
      'https://instagram.fdel.net/v/t50/sample_reel.mp4'
    );
    assert.equal(provider.extractMetaContent(sampleHtml, 'og:description'), null);
  });

  test('normalizeMetadata normalizes Reel and Video formats', () => {
    const rawVideo = {
      id: 'C3abc123xyz',
      url: 'https://www.instagram.com/reel/C3abc123xyz/',
      type: 'video',
      title: 'Sunset in the mountains',
      author: '@nature',
      thumbnail: 'https://instagram.fdel.net/thumb.jpg',
      videoUrl: 'https://instagram.fdel.net/video.mp4'
    };

    const normalized = provider.normalizeMetadata(rawVideo);

    assert.equal(normalized.platform, 'instagram');
    assert.equal(normalized.id, 'C3abc123xyz');
    assert.equal(normalized.type, 'video');
    assert.equal(normalized.title, 'Sunset in the mountains');
    assert.equal(normalized.author, '@nature');
    assert.ok(Array.isArray(normalized.formats));

    const videoFormat = normalized.formats.find((f) => f.formatId === 'video_hd_mp4');
    assert.ok(videoFormat);
    assert.equal(videoFormat.container, 'mp4');
    assert.equal(videoFormat.quality, 'Original HD');

    const audioFormat = normalized.formats.find((f) => f.formatId === 'audio_mp3');
    assert.ok(audioFormat);
    assert.equal(audioFormat.type, 'audio');
  });

  test('normalizeMetadata normalizes Photo post formats', () => {
    const rawPhoto = {
      id: 'C99xyz123',
      url: 'https://www.instagram.com/p/C99xyz123/',
      type: 'photo',
      title: 'Landscape Photo',
      author: '@photographer',
      thumbnail: 'https://instagram.fdel.net/photo.jpg'
    };

    const normalized = provider.normalizeMetadata(rawPhoto);

    assert.equal(normalized.platform, 'instagram');
    assert.equal(normalized.type, 'photo');

    const photoFormat = normalized.formats.find((f) => f.formatId === 'photo_jpg');
    assert.ok(photoFormat);
    assert.equal(photoFormat.container, 'jpg');
    assert.equal(photoFormat.type, 'photo');
  });

  describe('Integration via API Endpoints', () => {
    let server;
    let baseUrl;

    before(async () => {
      const app = createApp();
      await new Promise((resolve) => {
        server = app.listen(0, '127.0.0.1', () => {
          const port = server.address().port;
          baseUrl = `http://127.0.0.1:${port}`;
          resolve();
        });
      });
    });

    after(async () => {
      if (server) {
        await new Promise((resolve) => server.close(resolve));
      }
    });

    test('POST /api/v1/media/analyze handles Instagram Reel URL with appropriate response or error envelope', async () => {
      const res = await fetch(`${baseUrl}/api/v1/media/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: 'https://www.instagram.com/reel/C3abc123xyz/' })
      });

      // Status can be 200 (public), 403 (private/login required), 404 (not found), or 503 (provider unreachable)
      assert.ok([200, 403, 404, 503].includes(res.status));
      const json = await res.json();
      assert.ok('success' in json);
    });
  });
});
