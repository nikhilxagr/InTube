import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { YouTubeProvider } from '../src/providers/youtube/youtube.provider.js';
import { createApp } from '../src/app.js';

describe('YouTube Provider — yt-dlp Metadata Extraction & Error Handling', () => {
  const provider = new YouTubeProvider();

  test('canHandle and validate correct YouTube URL structures', () => {
    const valid = [
      new URL('https://www.youtube.com/watch?v=dQw4w9WgXcQ'),
      new URL('https://youtu.be/dQw4w9WgXcQ'),
      new URL('https://www.youtube.com/shorts/3i_JmJ7eH5c'),
      new URL('https://m.youtube.com/watch?v=dQw4w9WgXcQ'),
      new URL('https://www.youtube.com/embed/dQw4w9WgXcQ')
    ];

    for (const url of valid) {
      assert.equal(provider.canHandle(url), true);
      assert.equal(provider.validate(url), true);
    }
  });

  test('validate rejects URLs missing video identifiers', () => {
    const invalid = [
      new URL('https://www.youtube.com/'),
      new URL('https://www.youtube.com/feed/trending'),
      new URL('https://www.youtube.com/channel/UCuAXFkgsw1L7xaCfnd5JJOw')
    ];

    for (const url of invalid) {
      assert.equal(provider.validate(url), false);
    }
  });

  test('normalizeMetadata produces standard schema with yt-dlp format data', () => {
    const mockRaw = {
      id: 'dQw4w9WgXcQ',
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      type: 'video',
      title: 'Rick Astley - Never Gonna Give You Up',
      author: 'Rick Astley',
      duration: 213,
      thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
      // Simulate yt-dlp ytFormats field
      ytFormats: [
        {
          format_id: '137',
          ext: 'mp4',
          vcodec: 'avc1.640028',
          acodec: 'none',
          height: 1080,
          width: 1920,
          tbr: 3500,
          filesize: 90000000
        },
        {
          format_id: '136',
          ext: 'mp4',
          vcodec: 'avc1.4d401f',
          acodec: 'none',
          height: 720,
          width: 1280,
          tbr: 1500,
          filesize: 40000000
        },
        {
          format_id: '140',
          ext: 'm4a',
          vcodec: 'none',
          acodec: 'mp4a.40.2',
          tbr: 128,
          filesize: 3500000
        }
      ]
    };

    const normalized = provider.normalizeMetadata(mockRaw);

    assert.equal(normalized.platform, 'youtube');
    assert.equal(normalized.id, 'dQw4w9WgXcQ');
    assert.equal(normalized.title, 'Rick Astley - Never Gonna Give You Up');
    assert.equal(normalized.author, 'Rick Astley');
    assert.equal(normalized.duration, 213);
    assert.ok(Array.isArray(normalized.formats));

    // Verify format entries
    const format1080p = normalized.formats.find((f) => f.formatId === 'video_1080p_mp4' || f.quality.includes('1080p'));
    assert.ok(format1080p, '1080p format should be present');
    assert.equal(format1080p.container, 'mp4');
    assert.equal(format1080p.approxSize, 90000000);

    const formatMp3 = normalized.formats.find((f) => f.formatId === 'audio_mp3');
    assert.ok(formatMp3, 'audio_mp3 format should be present');
    assert.equal(formatMp3.type, 'audio');
    assert.equal(formatMp3.container, 'mp3');
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

    test('POST /api/v1/media/analyze retrieves authentic metadata for public YouTube URL', async () => {
      const res = await fetch(`${baseUrl}/api/v1/media/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' })
      });

      assert.equal(res.status, 200);
      const json = await res.json();

      assert.equal(json.success, true);
      assert.equal(json.data.platform, 'youtube');
      assert.equal(json.data.id, 'dQw4w9WgXcQ');
      assert.ok(json.data.title.length > 0);
      assert.ok(json.data.thumbnail.includes('http'));
      assert.ok(Array.isArray(json.data.formats));
      assert.ok(json.data.formats.length > 0);
    });

    test('POST /api/v1/media/analyze on invalid YouTube video ID returns error', async () => {
      const res = await fetch(`${baseUrl}/api/v1/media/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: 'https://www.youtube.com/watch?v=nonExistentVideo123456789' })
      });

      assert.ok([404, 400, 422, 503].includes(res.status));
      const json = await res.json();
      assert.equal(json.success, false);
      assert.ok(json.error.code);
    });
  });
});
