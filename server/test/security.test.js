import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/app.js';
import { ErrorCodes } from '../src/utils/errors.js';

describe('Security, SSRF Guard & Media Analyze API Validation', () => {
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

  test('Non-existent route returns standard 404 JSON error envelope', async () => {
    const res = await fetch(`${baseUrl}/api/v1/unknown-endpoint-path`);
    assert.equal(res.status, 404);

    const json = await res.json();
    assert.equal(json.success, false);
    assert.equal(json.error.code, 'NOT_FOUND');
    assert.ok(json.error.message.includes('Route not found'));
  });

  test('POST /api/v1/media/analyze without body returns 400 INVALID_URL', async () => {
    const res = await fetch(`${baseUrl}/api/v1/media/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });

    assert.equal(res.status, 400);
    const json = await res.json();
    assert.equal(json.success, false);
    assert.equal(json.error.code, ErrorCodes.INVALID_URL);
  });

  test('POST /api/v1/media/analyze with private IPv4 blocks with 400 INVALID_URL', async () => {
    const privateTargets = [
      'https://127.0.0.1/watch?v=123',
      'https://10.0.0.1/watch?v=123',
      'https://172.16.0.1/watch?v=123',
      'https://192.168.1.1/watch?v=123',
      'https://169.254.169.254/latest/meta-data/',
      'https://localhost:8080/media'
    ];

    for (const url of privateTargets) {
      const res = await fetch(`${baseUrl}/api/v1/media/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });

      assert.equal(res.status, 400, `Expected 400 for ${url}`);
      const json = await res.json();
      assert.equal(json.success, false);
      assert.equal(json.error.code, ErrorCodes.INVALID_URL);
    }
  });

  test('POST /api/v1/media/analyze with decimal integer SSRF returns 400 INVALID_URL', async () => {
    const res = await fetch(`${baseUrl}/api/v1/media/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: 'https://2130706433/watch?v=123' }) // 127.0.0.1
    });

    assert.equal(res.status, 400);
    const json = await res.json();
    assert.equal(json.success, false);
    assert.equal(json.error.code, ErrorCodes.INVALID_URL);
  });

  test('POST /api/v1/media/analyze with forbidden protocols returns 400 INVALID_URL', async () => {
    const res = await fetch(`${baseUrl}/api/v1/media/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: 'file:///etc/passwd' })
    });

    assert.equal(res.status, 400);
    const json = await res.json();
    assert.equal(json.success, false);
    assert.equal(json.error.code, ErrorCodes.INVALID_URL);
  });

  test('POST /api/v1/media/analyze with unsupported platform domain returns 400 UNSUPPORTED_PLATFORM', async () => {
    const res = await fetch(`${baseUrl}/api/v1/media/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: 'https://vimeo.com/12345678' })
    });

    assert.equal(res.status, 400);
    const json = await res.json();
    assert.equal(json.success, false);
    assert.equal(json.error.code, ErrorCodes.UNSUPPORTED_PLATFORM);
    assert.ok(json.error.message.includes('No provider'));
  });
});
